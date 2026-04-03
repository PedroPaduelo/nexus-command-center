---
name: Registrar Interação CRM 99Freelas
description: OBRIGATORIO — usar TODA VEZ que interagir no 99Freelas: enviar mensagem, follow-up, proposta, ler resposta do cliente, negociar, fechar ou perder negocio. Registra a interacao no CRM para manter historico completo e atualizar pipeline automaticamente.
---

# Registrar Interação no CRM do 99Freelas

## Regra de Ouro

**TODA interação no 99Freelas DEVE ser registrada no CRM.** Sem exceção:

- Você enviou uma mensagem no chat
- Você enviou um follow-up
- Você enviou ou melhorou uma proposta
- O cliente respondeu (você leu a resposta)
- Negociação em andamento
- Proposta aceita ou rejeitada
- Negócio fechado ou perdido
- Você adicionou uma nota sobre uma conversa

## Fluxo Obrigatório

1. Interaja no 99Freelas (envie mensagem, leia resposta, etc.)
2. **Imediatamente** registre no CRM via API
3. Confirme que retornou `ok: true`
4. Só então considere a ação concluída

---

## API de Registro

**Endpoint:** `POST https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/register`  
**Header:** `x-api-key: scraper-key-2026`

### Payload

```json
{
  "idConversa99": 16260521,
  "idProjeto99": 12345678,
  "nomeProjeto": "Nome do projeto no 99Freelas",
  "nomeCliente": "Nome do cliente",
  "idCliente99": 987654,
  "type": "message_sent",
  "content": "Texto completo da mensagem ou descrição detalhada da ação",
  "source": "agent",
  "stageAtual": "proposta_enviada_sem_resposta",
  "stageNovo": "aguardando_resposta"
}
```

### Campos obrigatórios

- **idConversa99** (number): ID da conversa — número no final da URL `/messages/inbox/XXXXX`
- **type** (string): Tipo da interação (ver tabela)
- **content** (string): Texto completo ou descrição detalhada

### Campos recomendados

- **nomeProjeto**, **nomeCliente**, **idProjeto99**, **idCliente99**
- **source**: `"agent"` (automático), `"human"` (Myke manual), `"system"`, `"auto"`
- **stageAtual**, **stageNovo**: stages antes e depois da ação

---

## Tipos de Interação

| type | Quando usar |
|------|-------------|
| `message_sent` | Você enviou mensagem no chat |
| `message_received` | O cliente respondeu |
| `followup_sent` | Follow-up enviado |
| `proposal_sent` | Proposta enviada |
| `proposal_improved` | Proposta atualizada |
| `proposal_accepted` | Cliente aceitou |
| `proposal_rejected` | Cliente rejeitou |
| `negotiation` | Negociação em andamento |
| `deal_closed` | Negócio fechado |
| `deal_lost` | Negócio perdido |
| `note` | Nota interna |

---

## Stages do Pipeline

| Stage | Significado |
|-------|-------------|
| `proposta_enviada_sem_resposta` | Proposta enviada, aguardando |
| `aguardando_resposta` | Mensagem enviada, aguardando |
| `myke_aguardando_cliente` | Cliente respondeu, vez de Myke |
| `em_negociacao` | Negociação ativa |
| `proposta_aceita` | Aceitou formalmente |
| `contrato_fechado` | Negócio fechado |
| `rejeitada` | Proposta rejeitada |
| `perdida` | Oportunidade perdida |
| `follow_up_pendente` | Precisa de follow-up |

---

## Exemplos

### Mensagem enviada

```bash
curl -s -X POST https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: scraper-key-2026" \
  -d '{
    "idConversa99": 16260521,
    "nomeProjeto": "App Mobile 60 Telas",
    "nomeCliente": "Dino A.",
    "type": "message_sent",
    "content": "Texto da mensagem enviada aqui",
    "source": "agent",
    "stageAtual": "proposta_enviada_sem_resposta",
    "stageNovo": "aguardando_resposta"
  }'
```

### Resposta do cliente recebida

```bash
curl -s -X POST https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: scraper-key-2026" \
  -d '{
    "idConversa99": 16260521,
    "nomeProjeto": "App Mobile 60 Telas",
    "nomeCliente": "Dino A.",
    "type": "message_received",
    "content": "Texto da resposta do cliente",
    "source": "human",
    "stageNovo": "myke_aguardando_cliente"
  }'
```

### Batch — follow-ups em lote

```bash
curl -s -X POST https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: scraper-key-2026" \
  -d '{
    "interactions": [
      {
        "idConversa99": 16260521,
        "nomeProjeto": "Projeto A",
        "nomeCliente": "Cliente 1",
        "type": "followup_sent",
        "content": "Texto do follow-up",
        "source": "agent"
      }
    ]
  }'
```

---

## O que o CRM faz automaticamente

Ao registrar, o CRM executa 7 passos:

1. Encontra ou cria a conversa no banco
2. Salva a mensagem na tabela Message
3. Atualiza o stage da conversa
4. Atualiza o Pipeline (se houver projeto vinculado)
5. Cria AuditLog para o feed de atividades
6. Cria Notification para eventos importantes
7. Cria AgentRun para rastrear ações do agente

---

## Endpoints Auxiliares

Histórico de uma conversa:
`GET https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/{idConversa99}`

Interações recentes do agente:
`GET https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/recent?limit=10&source=agent`

Estatísticas:
`GET https://99freela-crm-api.ddw1sl.easypanel.host/api/interactions/stats`

---

## Checklist de Conformidade

Antes de encerrar qualquer tarefa com interação no 99Freelas:

- [ ] POST /api/interactions/register chamado com idConversa99 correto
- [ ] type correto para o que aconteceu
- [ ] content tem texto completo ou descrição detalhada
- [ ] source definido ("agent" para ações automáticas)
- [ ] stageNovo informado se o stage mudou
- [ ] Resposta retornou ok: true

Se o registro falhar, tente novamente. O histórico no CRM é crítico para acompanhar o pipeline.
