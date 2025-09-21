# API PIX UNIPAY

## Visão Geral

Sistema de pagamento PIX integrado exclusivamente com a UNIPAY usando a documentação oficial.

## Configuração

### Credenciais
- **URL:** `https://api.unipaybr.com/api`
- **Secret Key:** `sk_a0aab6155b590896932e3c92f49df02c59108c74`
- **Autenticação:** Basic Auth com formato `x:SECRET_KEY` convertido para base64

## Autenticação

A UNIPAY usa Basic Authentication com o formato específico:
```
Authorization: Basic <base64(x:SECRET_KEY)>
```

Exemplo:
- Secret Key: `sk_a0aab6155b590896932e3c92f49df02c59108c74`
- Formato: `x:sk_a0aab6155b590896932e3c92f49df02c59108c74`
- Base64: `eDpza19hMGFhYjYxNTViNTkwODk2OTMyZTNjOTJmNDlkZjAyYzU5MTA4Yzc0`

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

## Payload da UNIPAY

O sistema envia o seguinte payload para a UNIPAY:

```json
{
  "amount": 26323,
  "currency": "BRL",
  "paymentMethod": "PIX",
  "customer": {
    "name": "João da Silva",
    "email": "12345678900@temp.com",
    "document": {
      "number": "123.456.789-00",
      "type": "CPF"
    },
    "phone": "(11) 99999-9999",
    "externalRef": "cliente-12345678900",
    "address": {
      "street": "Avenida Paulista",
      "streetNumber": "123",
      "complement": "Apto 101",
      "zipCode": "01000000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "country": "BR"
    }
  },
  "shipping": {
    "fee": 0,
    "address": {
      "street": "Avenida Paulista",
      "streetNumber": "123",
      "complement": "Apto 101",
      "zipCode": "01000000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "country": "BR"
    }
  },
  "items": [{
    "title": "Produto005",
    "unitPrice": 26323,
    "quantity": 1,
    "tangible": true,
    "externalRef": "produto-12345678900"
  }],
  "pix": {
    "expiresInDays": 1
  },
  "postbackUrl": "https://meusite.com/webhook/pagamentos",
  "metadata": "{\"cpf\":\"123.456.789-00\",\"phone\":\"(11) 99999-9999\",\"source\":\"Organico-x1\",\"timestamp\":\"2024-01-01T12:00:00.000Z\"}",
  "traceable": true,
  "ip": "192.168.1.1"
}
```

## Logs

O sistema gera logs para debugging:
```
[UNIPAY] Creating PIX payment: { cpf: "123.456.789-00", name: "João da Silva", ... }
[UNIPAY] Auth header: Basic eDpza19hMGFhYjYxNTViNTkwODk2...
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

## Diferenças da Implementação Anterior

1. **URL Correta:** `https://api.unipaybr.com/api` (não mais fastsoftbrasil)
2. **Autenticação Correta:** `x:SECRET_KEY` convertido para base64
3. **Payload Completo:** Seguindo a documentação oficial da UNIPAY
4. **Campos Adicionais:** `externalRef`, `postbackUrl`, `traceable`, `ip`
