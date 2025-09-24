# 🔍 Debug - Notificação UTMFY não aparecendo

## 📋 Checklist de Verificação

### 1. **Verificar se o webhook está sendo chamado**

Quando você gerar um PIX, verifique nos logs se aparece:

```
[FreePay Webhook] Received postback: {...}
[FreePay Webhook] Request headers: {...}
```

**Se não aparecer**: O webhook não está sendo chamado pela FreePay.

### 2. **Verificar o status da transação**

Nos logs, procure por:

```
[FreePay Webhook] Processing transaction: {
  id: "tx_123456789",
  status: "waiting_payment", // ← Verificar este status
  amount: 26323,
  ...
}
```

**Status esperados para venda pendente:**
- `waiting_payment`
- `processing`

### 3. **Verificar se a função handleWaitingTransaction é chamada**

Procure por:

```
[FreePay Webhook] Transaction WAITING/PROCESSING: {
  id: "tx_123456789",
  status: "waiting_payment",
  amount: 26323,
  customer: "Nome do Cliente"
}
```

### 4. **Verificar se a notificação UTMFY é iniciada**

Procure por:

```
[FreePay Webhook] Starting UTMFY notification: {
  transactionId: "tx_123456789",
  status: "waiting_payment",
  amount: 26323,
  customer: "Nome do Cliente"
}
```

### 5. **Verificar o payload enviado para UTMFY**

Procure por:

```
[FreePay Webhook] UTMFY payload: {
  "orderId": "tx_123456789",
  "platform": "FreePay",
  "paymentMethod": "pix",
  "status": "waiting_payment",
  "createdAt": "2024-01-15 10:25:00",
  "approvedDate": null,
  ...
}
```

### 6. **Verificar resposta da UTMFY**

Procure por:

```
[FreePay Webhook] UTMFY notification sent successfully: {
  orderId: "tx_123456789",
  status: 200,
  response: "OK"
}
```

**OU erro:**

```
[FreePay Webhook] Error sending UTMFY notification: Error: UTMFY API error: 400 Bad Request - Invalid payload
```

## 🚨 Possíveis Problemas

### **Problema 1: Webhook não é chamado**
**Sintomas**: Não aparecem logs de "Received postback"
**Solução**: 
1. Verificar se a URL do webhook está configurada corretamente na FreePay
2. Verificar se o domínio está acessível
3. Verificar se não há firewall bloqueando

### **Problema 2: Status incorreto**
**Sintomas**: Webhook é chamado mas com status diferente
**Solução**: 
1. Verificar qual status a FreePay está enviando
2. Ajustar o código se necessário

### **Problema 3: Erro na API UTMFY**
**Sintomas**: Logs mostram erro 400/401/500
**Solução**:
1. Verificar se o token está correto
2. Verificar se o payload está no formato correto
3. Verificar se a conta UTMFY está ativa

### **Problema 4: Erro de rede**
**Sintomas**: Timeout ou erro de conexão
**Solução**:
1. Verificar conectividade com api.utmify.com.br
2. Verificar se não há proxy/firewall bloqueando

## 🛠️ Comandos de Debug

### **Testar webhook manualmente:**
```bash
curl -X POST "https://seu-dominio.com/api/freepay-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transaction",
    "data": {
      "id": "test_123",
      "status": "waiting_payment",
      "amount": 26323,
      "customer": {
        "name": "Teste",
        "email": "teste@teste.com",
        "phone": "11999999999"
      },
      "paymentMethod": "PIX",
      "createdAt": "2024-01-15T10:25:00Z",
      "items": [{
        "title": "Produto Teste",
        "unitPrice": 26323,
        "quantity": 1,
        "externalRef": "test_123"
      }]
    }
  }'
```

### **Testar API UTMFY diretamente:**
```bash
curl -X POST "https://api.utmify.com.br/api-credentials/orders" \
  -H "Content-Type: application/json" \
  -H "x-api-token: IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq" \
  -d '{
    "orderId": "test_123",
    "platform": "FreePay",
    "paymentMethod": "pix",
    "status": "waiting_payment",
    "createdAt": "2024-01-15 10:25:00",
    "approvedDate": null,
    "refundedAt": null,
    "customer": {
      "name": "Teste",
      "email": "teste@teste.com",
      "phone": "11999999999",
      "document": null,
      "country": "BR",
      "ip": null
    },
    "products": [{
      "id": "test_123",
      "name": "Produto Teste",
      "planId": null,
      "planName": null,
      "quantity": 1,
      "priceInCents": 26323
    }],
    "trackingParameters": {
      "src": null,
      "sck": null,
      "utm_source": null,
      "utm_campaign": null,
      "utm_medium": null,
      "utm_content": null,
      "utm_term": null
    },
    "commission": {
      "totalPriceInCents": 26323,
      "gatewayFeeInCents": 1316,
      "userCommissionInCents": 25007,
      "currency": "BRL"
    },
    "isTest": true
  }'
```

## 📊 Logs Esperados

### **Fluxo completo de venda pendente:**

```
[FreePay Webhook] Received postback: {...}
[FreePay Webhook] Request headers: {...}
[FreePay Webhook] Processing transaction: { id: "tx_123", status: "waiting_payment", ... }
[FreePay Webhook] Transaction WAITING/PROCESSING: { id: "tx_123", status: "waiting_payment", ... }
[FreePay Webhook] Starting UTMFY notification: { transactionId: "tx_123", status: "waiting_payment", ... }
[FreePay Webhook] Sending UTMFY notification: { orderId: "tx_123", status: "waiting_payment", ... }
[FreePay Webhook] UTMFY payload: {...}
[FreePay Webhook] UTMFY notification sent successfully: { orderId: "tx_123", status: 200, ... }
[FreePay Webhook] Transaction is waiting for payment: tx_123
```

## 🆘 Próximos Passos

1. **Gere um novo PIX** e verifique os logs
2. **Identifique em qual etapa** o processo para
3. **Use os comandos de debug** para testar manualmente
4. **Verifique a conta UTMFY** para ver se as notificações chegaram

---

**Status**: 🔍 Debug ativo
**Última atualização**: Janeiro 2024
