# API PIX UNIPAY

## Visão Geral

Sistema de pagamento PIX integrado exclusivamente com a UNIPAY.

## Configuração

### Credenciais
- **URL:** `https://api.unipaybr.com/api`
- **Public Key:** `pk_b43b6992da8621f3940d675ed1a5f954091fb37e`
- **Secret Key:** `sk_a0aab6155b590896932e3c92f49df02c59108c74`

## Endpoints

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
  "metadata": {
    "cpf": "123.456.789-00",
    "phone": "(11) 99999-9999",
    "source": "Organico-x1",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. Consultar Status da Transação

**Endpoint:** `POST /api/pix-status`

**Payload:**
```json
{
  "transactionId": "abc123"
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
  "updatedAt": "2024-01-01T12:05:00.000Z",
  "customer": {
    "name": "João da Silva",
    "email": "12345678900@temp.com",
    "phone": "11999999999"
  },
  "pix": {
    "qrcode": "https://digital.mundipagg.com/pix/abc123",
    "expirationDate": "2024-01-02T12:00:00.000Z",
    "end2EndId": null,
    "receiptUrl": "https://receipt.example.com/abc123"
  }
}
```

## Estrutura do Projeto

```
app/api/
├── consultar-cpf/          # Consulta CPF (mantido)
├── pix-payment/           # Criar transação PIX
└── pix-status/            # Consultar status da transação
```

## Autenticação

A UNIPAY usa Basic Authentication com o formato:
```
Authorization: Basic <base64(SECRET_KEY:x)>
```

## Logs

O sistema gera logs para debugging:
```
[UNIPAY] Creating PIX payment: { cpf: "123.456.789-00", name: "João da Silva", ... }
[UNIPAY] Response status: 200
[UNIPAY] PIX transaction created successfully: { id: "abc123", ... }
```

## Tratamento de Erros

- **Validação de dados:** CPF, nome e telefone são obrigatórios
- **Erros da API:** Retornados com status HTTP e mensagem específica
- **Logs detalhados:** Todos os erros são logados para debugging

## Exemplo de Uso

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
    transactionId: transaction.transactionId
  })
});

const status = await statusResponse.json();
```
