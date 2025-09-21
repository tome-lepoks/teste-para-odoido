# Sistema de Roteamento PIX - UNIPAY & FREEPAY

## Visão Geral

Este sistema implementa um roteamento inteligente que distribui transações PIX entre duas APIs na proporção **3:1**:
- **UNIPAY**: 3 transações a cada 4
- **FREEPAY**: 1 transação a cada 4

> **Nota:** Este é o único sistema de pagamento PIX ativo no projeto. Todas as outras integrações (PayEvo, CenturionPay, FlowsPayments) foram removidas.

## Arquitetura

### Arquivos Principais

1. **`lib/pix-router.ts`** - Sistema de roteamento e contador
2. **`app/api/pix-payment/route.ts`** - Endpoint principal unificado
3. **`app/api/unipay-pix/route.ts`** - Integração com UNIPAY
4. **`app/api/freepay-pix/route.ts`** - Integração com FREEPAY
5. **`app/api/pix-status/route.ts`** - Consulta de status das transações

## Como Usar

### 1. Criar Transação PIX

**Endpoint:** `POST /api/pix-payment`

**Payload:**
```json
{
  "amount": 263.23,
  "cpf": "123.456.789-00",
  "name": "João da Silva",
  "phone": "(11) 99999-9999"
}
```

**Resposta:**
```json
{
  "success": true,
  "pixCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/...",
  "amount": 263.23,
  "transactionId": "abc123",
  "expiresAt": "2024-01-01T12:00:00.000Z",
  "provider": "unipay",
  "status": "waiting_payment",
  "customer": {
    "name": "João da Silva",
    "email": "12345678900@temp.com",
    "phone": "11999999999"
  },
}
```

### 2. Consultar Status da Transação

**Endpoint:** `POST /api/pix-status`

**Payload:**
```json
{
  "transactionId": "abc123",
  "provider": "unipay"
}
```

**Resposta:**
```json
{
  "success": true,
  "transactionId": "abc123",
  "provider": "unipay",
  "status": "paid",
  "amount": 26323,
  "paidAt": "2024-01-01T12:05:00.000Z",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```


## Lógica de Roteamento

O sistema usa um contador que alterna entre as APIs seguindo o padrão:

```
Transação 1: UNIPAY
Transação 2: UNIPAY  
Transação 3: UNIPAY
Transação 4: FREEPAY
Transação 5: UNIPAY
Transação 6: UNIPAY
Transação 7: UNIPAY
Transação 8: FREEPAY
... e assim por diante
```

## Configurações das APIs

### UNIPAY
- **URL:** `https://api.unipaybr.com/api`
- **Autenticação:** Basic Auth com SECRET_KEY
- **Chave Secreta:** `sk_a0aab6155b590896932e3c92f49df02c59108c74`

### FREEPAY
- **URL:** `https://api.freepaybr.com/functions/v1/transactions`
- **Autenticação:** Basic Auth com SECRET_KEY
- **Chave Secreta:** `sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL`

## Logs e Monitoramento

O sistema gera logs discretos para debugging interno:

```
[Router] #1 -> unipay
[PIX] Provider: unipay
[UNIPAY] Creating payment
[UNIPAY] Status: 200
[UNIPAY] Transaction created
```

## Tratamento de Erros

- **Validação de dados:** CPF, nome e telefone são obrigatórios
- **Fallback:** Se uma API falhar, o erro é retornado com informações do provider
- **Logs detalhados:** Todos os erros são logados para debugging

## Exemplo de Uso Completo

```javascript
// 1. Criar transação
const response = await fetch('/api/pix-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 263.23,
    cpf: "123.456.789-00",
    name: "João da Silva",
    phone: "(11) 99999-9999"
  })
});

const transaction = await response.json();

// 2. Verificar status
const statusResponse = await fetch('/api/pix-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transactionId: transaction.transactionId,
    provider: transaction.provider
  })
});

const status = await statusResponse.json();
```

## Vantagens do Sistema

1. **Distribuição Automática:** Não precisa gerenciar manualmente qual API usar
2. **Transparência:** O roteamento é transparente para o usuário final
3. **Escalabilidade:** Fácil adicionar novas APIs ou alterar proporções
4. **Logs Discretos:** Logs internos para debugging sem expor informações sensíveis
5. **Fallback:** Tratamento robusto de erros
