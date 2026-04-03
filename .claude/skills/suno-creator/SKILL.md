---
name: suno-creator
description: Cria músicas no Suno.com via browser automation. Abre o modo Advanced, preenche Lyrics e Style, e clica Create UMA ÚNICA VEZ (o Suno já gera 2 músicas por clique automaticamente).
---

# Skill: Suno Creator

Você é um especialista em criar músicas no Suno.com via automação de browser.

## Processo validado em produção (30/03/2026)

### 1. Abrir sessão
```
create_automation_session(url: "https://suno.com/create")
smart_wait(conditions: [{type: "dom_stable", duration: 2000}])
```

### 2. Ativar modo Advanced
```
click_element(text: "Advanced")
smart_wait(conditions: [{type: "dom_stable", duration: 1000}])
```

### 3. Preencher Lyrics e Style via JavaScript
O Suno usa React — `fill_field` e `type_text` NÃO funcionam. SEMPRE use este padrão:
```javascript
const lyrics = `...seu texto aqui...`;
const style = `...seu style aqui...`;

const tas = document.querySelectorAll('textarea');
const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

setter.call(tas[0], lyrics);
tas[0].dispatchEvent(new Event('input', { bubbles: true }));

setter.call(tas[1], style);
tas[1].dispatchEvent(new Event('input', { bubbles: true }));

return 'ok';
```

### 4. Clicar Create — UMA ÚNICA VEZ com clickParent: false

⚠️ **CRÍTICO — A CAUSA DOS CLIQUES DUPLOS:**
O `click_element` tem `clickParent: true` por padrão, o que faz ele clicar no botão **E** no elemento pai — gerando 2 cliques = 4 músicas = 40 créditos.

**SEMPRE use `execute_script` para clicar no Create:**
```javascript
document.querySelector('[aria-label="Create song"]').click();
return 'clicado';
```

NUNCA use `click_element` no botão Create. Use APENAS `execute_script` com `.click()` diretamente no elemento.

### 5. Aguardar e confirmar
```
smart_wait(conditions: [{type: "dom_stable", duration: 4000}], timeout: 25000)
```
Depois verifique que os créditos caíram exatamente 20 pontos:
```javascript
return document.querySelector('[data-testid="profile-menu-button"]')
  ?.textContent?.match(/(\d+) credits/)?.[1];
```
Se caiu 40 = clicou duas vezes. Se caiu 20 = correto.

### 6. Próximo bloco — reutilize a mesma sessão
Não feche nem reabra o browser entre blocos. Apenas sobrescreva os campos via JavaScript (passo 3) e execute o click via script (passo 4).

## Contagem de créditos esperada por sessão

| Blocos criados | Músicas geradas | Créditos gastos |
|---------------|----------------|----------------|
| 1 | 2 | 20 |
| 2 | 4 | 40 |
| 3 | 6 | 60 |
| 4 | 8 | 80 |
| 5 | 10 | 100 |

## O que NÃO fazer
- ❌ Não usar `fill_field` ou `type_text` — não funciona com React
- ❌ Não usar `click_element` no botão Create — causa double click via clickParent
- ❌ Não usar `double_click` no botão Create
- ❌ Não clicar Create mais de uma vez por bloco
- ❌ Não fechar a sessão entre blocos
- ❌ Não usar `page_ready` após Create — o Suno não recarrega
