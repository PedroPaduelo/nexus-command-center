---
name: radio-serendipd-update
description: Atualiza a Rádio Serendipd de ponta a ponta: lê a edição JSON mais recente, cria músicas no Suno para cada bloco (2 músicas por bloco via Advanced mode), coleta os IDs gerados, salva no JSON da edição, importa no banco PostgreSQL via POST /importar com owner=maruan, e atualiza musicas.json. Disparada quando o usuário diz "Atualize as notícias" ou similar.
---

# Skill: Radio Serendipd — Update Completo

Você é o pipeline de atualização da Rádio Serendipd. Quando o usuário disser "Atualize as notícias", "atualiza a rádio", ou similar, execute **todos os passos abaixo na ordem**.

---

## Contexto do Projeto

- **Pasta do projeto:** `/workspace/temp-orquestrador/users/5aaf347f-952f-4355-8513-ac3f4024b43e/projetos/core/news`
- **Edições:** `news/editions/*.json` — cada arquivo é uma edição com `blocks[]`
- **API:** `https://radio-api.ddw1sl.easypanel.host`
- **Frontend:** `https://radio-serendipd.ddw1sl.easypanel.host/musicas.html`
- **musicas.json:** `news/musicas.json` — array local de músicas (para backup/cache)

## Estrutura de um bloco no JSON de edição

```json
{
  "id": "b1",
  "order": 1,
  "title": "Abertura — ...",
  "tag": "AO VIVO",
  "song_id_v1": null,
  "song_id_v2": null,
  "suno_lyrics": "[Intro | ...]\n...",
  "suno_style": "satirical upbeat news broadcast 128 BPM, ..."
}
```

---

## PASSO 1 — Identificar a edição mais recente

```bash
ls -t /workspace/temp-orquestrador/users/5aaf347f-952f-4355-8513-ac3f4024b43e/projetos/core/news/editions/*.json | head -1
```

Leia o arquivo identificado. Encontre todos os blocos que **não têm `song_id_v1`** (null, vazio ou campo ausente). Esses são os blocos que precisam de músicas.

Se todos os blocos já têm `song_id_v1`, informe o usuário: "Edição [id] já tem todas as músicas criadas."

---

## PASSO 2 — Criar músicas no Suno (um bloco por vez)

Use a **skill suno-creator** como referência de técnica, mas siga estas instruções específicas:

### 2.1 — Abrir sessão
```
create_automation_session(url: "https://suno.com/create")
smart_wait(conditions: [{type: "dom_stable", duration: 3000}])
```

### 2.2 — Verificar créditos iniciais
```javascript
return document.querySelector('[data-testid="profile-menu-button"]')
  ?.textContent?.match(/(\d+)/)?.[1] ?? 'não encontrado';
```
Anote o valor. Cada bloco custa **20 créditos**.

### 2.3 — Para CADA bloco sem song_id (mesma sessão, não feche entre blocos):

**a) Ativar Advanced:**
```
click_element(text: "Advanced")
smart_wait(conditions: [{type: "dom_stable", duration: 1000}])
```

**b) Preencher Lyrics e Style via JS (OBRIGATÓRIO — fill_field não funciona no Suno):**
```javascript
const lyrics = `COLE AQUI O suno_lyrics DO BLOCO`;
const style = `COLE AQUI O suno_style DO BLOCO`;

const tas = document.querySelectorAll('textarea');
const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

setter.call(tas[0], lyrics);
tas[0].dispatchEvent(new Event('input', { bubbles: true }));

setter.call(tas[1], style);
tas[1].dispatchEvent(new Event('input', { bubbles: true }));

return tas[0].value.substring(0, 50) + ' | ' + tas[1].value.substring(0, 50);
```

**c) Clicar Create — SEMPRE via execute_script (NUNCA click_element):**
```javascript
document.querySelector('[aria-label="Create song"]').click();
return 'clicado';
```

**d) Aguardar geração (mínimo 15 segundos):**
```
smart_wait(conditions: [{type: "dom_stable", duration: 5000}], timeout: 30000)
```

**e) Confirmar que gastou 20 créditos (não 40):**
```javascript
return document.querySelector('[data-testid="profile-menu-button"]')
  ?.textContent?.match(/(\d+)/)?.[1];
```
Se caiu 40 → 2 cliques aconteceram. Note e continue (já foram criadas 4 músicas, use as 2 primeiras).

**f) Para próximo bloco:** NÃO feche o browser. Repita a partir do passo (a).

---

## PASSO 3 — Coletar IDs das músicas geradas

Após criar todos os blocos, colete os IDs via API do Suno:

```javascript
// Obter JWT do Clerk
const token = await window.Clerk.session.getToken();

// Buscar as últimas criações (10 mais recentes)
const res = await fetch('https://studio-api-prod.suno.com/api/feed/v2?page=0', {
  headers: { Authorization: 'Bearer ' + token }
});
const data = await res.json();

// Retornar lista com id, tags (style), created_at
return JSON.stringify(
  (data.clips || []).slice(0, 10).map(c => ({
    id: c.id,
    tags: c.metadata?.tags?.substring(0, 80),
    created_at: c.created_at,
    audio_url: c.audio_url,
    image_url: c.image_url,
    duration: c.metadata?.duration
  }))
);
```

### Como mapear ID → bloco

As músicas são geradas **em pares** e na **ordem em que você clicou Create**. O Suno retorna as mais recentes primeiro. Para N blocos criados:

- **Bloco N (último):** músicas 1 e 2 da lista → `song_id_v1` = item[0].id, `song_id_v2` = item[1].id
- **Bloco N-1:** músicas 3 e 4 → `song_id_v1` = item[2].id, `song_id_v2` = item[3].id
- **Bloco 1 (primeiro):** músicas (2N-1) e (2N)

Confirme o mapeamento verificando se `tags` contém palavras do `suno_style` de cada bloco.

Se precisar de dados completos de IDs específicos:
```javascript
const token = await window.Clerk.session.getToken();
const ids = 'ID1,ID2,ID3...';
const res = await fetch(`https://studio-api-prod.suno.com/api/feed/v2?ids=${ids}`, {
  headers: { Authorization: 'Bearer ' + token }
});
return JSON.stringify(await res.json());
```

---

## PASSO 4 — Atualizar o JSON da edição

Leia o arquivo da edição. Para cada bloco, adicione `song_id_v1` e `song_id_v2`. Escreva o arquivo de volta.

Exemplo de bloco atualizado:
```json
{
  "id": "b1",
  "song_id_v1": "3bd4c38f-671a-4c51-894f-51ee4445a970",
  "song_id_v2": "229368af-3b7b-4842-b92c-06f4ed938707",
  ...
}
```

---

## PASSO 5 — Importar músicas no banco PostgreSQL

Monte o payload com as músicas coletadas e chame:

```bash
curl -s -X POST https://radio-api.ddw1sl.easypanel.host/importar \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "maruan",
    "musicas": [
      {
        "id": "UUID",
        "title": "Radio Serendipd — [Titulo do Bloco] ed[N] (v1)",
        "audio_url": "https://cdn1.suno.ai/UUID.mp3",
        "image_url": "https://cdn2.suno.ai/image_UUID.jpeg",
        "video_url": null,
        "duration": 240,
        "style": "[suno_style do bloco]",
        "lyrics": "[suno_lyrics do bloco]",
        "model_version": "chirp-v4",
        "status": "complete",
        "is_public": true,
        "play_count": 0,
        "upvote_count": 0,
        "created_at": "[created_at da API do Suno]"
      }
    ]
  }'
```

Repita para todas as músicas geradas (2 por bloco × N blocos).

Confirme a resposta: `{"ok":true,"inseridas":N,...}`

---

## PASSO 6 — Atualizar musicas.json

Leia o arquivo `news/musicas.json`. As novas músicas devem ser inseridas **no início** do array (índice 0). Monte cada entrada com os campos completos coletados no Passo 3. Escreva o arquivo atualizado.

---

## PASSO 7 — Fechar sessão do browser

```
close_automation_session()
```

---

## PASSO 8 — Verificar no frontend

Abra no browser:
```
create_automation_session(url: "https://radio-serendipd.ddw1sl.easypanel.host/musicas.html")
```

Clique em "📰 Editorial Music" e confirme que a edição aparece com os blocos.
Clique em "📻 Rádio ao Vivo" e confirme que a playlist carregou com as faixas.

Tire screenshot se possível.

---

## PASSO 9 — Reportar ao usuário

Relate:
- Edição atualizada: ID e título
- Músicas criadas: N blocos × 2 versões = 2N músicas
- Créditos gastos: N × 20
- Links:
  - `https://radio-serendipd.ddw1sl.easypanel.host/musicas.html` → aba Editorial Music
  - `https://radio-serendipd.ddw1sl.easypanel.host/musicas.html` → aba Rádio ao Vivo

---

## Tratamento de erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Textareas não preenchidas | Suno ainda carregando | Aguarde mais 3s e tente novamente |
| Créditos caíram 40 | Double click via clickParent | Próximo bloco: use execute_script com `.click()` direto |
| `edicoesCache.map is not a function` | API retorna `{editions:[]}` | Extrair `data.editions` — já corrigido no código |
| Rádio mostra "Sem músicas" | Edição sem song_ids | Este pipeline é a solução |
| `window.Clerk.session` null | Suno não logado | Verificar login e tentar novamente |

---

## Atalho: se a edição já tem suno_lyrics e suno_style mas não tem song_ids

Esse é o caso típico. O pipeline começa direto no Passo 2 sem necessidade de geração de texto.

## Pré-condição do JSON da edição

Para que o pipeline funcione, o JSON da edição **deve ter `suno_lyrics` e `suno_style` em cada bloco**. Se não tiver, é necessário primeiro gerar o conteúdo editorial (outro processo separado).
