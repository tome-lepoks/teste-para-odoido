# 🚀 Implementação Webhook UTMFY - Vendas PIX

## ✅ **Implementação Concluída**

### 📋 **Funcionalidades Implementadas:**

1. **✅ Notificações de Vendas Pendentes** (`waiting_payment`)
   - Enviadas quando PIX é gerado mas ainda não pago
   - Status: `waiting_payment`

2. **✅ Notificações de Vendas Aprovadas** (`paid`)
   - Enviadas quando PIX é pago com sucesso
   - Status: `paid`

3. **✅ Filtro por Método de Pagamento**
   - **APENAS PIX** é enviado para UTMFY
   - Outros métodos (cartão, boleto) são ignorados

### 🔧 **Configuração Técnica:**

#### **Endpoint UTMFY:**
```
POST https://api.utmify.com.br/api-credentials/orders
```

#### **Headers:**
```json
{
  "Content-Type": "application/json",
  "x-api-token": "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq"
}
```

#### **Payload Exemplo - Venda Pendente:**
```json
{
  "orderId": "tx_123456",
  "platform": "FreePay",
  "paymentMethod": "pix",
  "status": "waiting_payment",
  "createdAt": "2024-01-15 10:25:00",
  "approvedDate": null,
  "refundedAt": null,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "document": null,
    "country": "BR",
    "ip": null
  },
  "products": [{
    "id": "tx_123456",
    "name": "Produto FreePay",
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
  "isTest": false
}
```

#### **Payload Exemplo - Venda Aprovada:**
```json
{
  "orderId": "tx_123456",
  "platform": "FreePay",
  "paymentMethod": "pix",
  "status": "paid",
  "createdAt": "2024-01-15 10:25:00",
  "approvedDate": "2024-01-15 10:30:00",
  "refundedAt": null,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "document": null,
    "country": "BR",
    "ip": null
  },
  "products": [{
    "id": "tx_123456",
    "name": "Produto FreePay",
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
  "isTest": false
}
```

### 🎯 **Fluxo de Funcionamento:**

#### **1. PIX Gerado (Venda Pendente):**
```
FreePay → Webhook → handleWaitingTransaction() → sendUTMFYNotification('waiting_payment')
```

#### **2. PIX Pago (Venda Aprovada):**
```
FreePay → Webhook → handlePaidTransaction() → sendUTMFYNotification('paid')
```

### 📊 **Logs de Debug:**

#### **Venda Pendente:**
```
[FreePay Webhook] Starting UTMFY notification: { status: "waiting_payment", paymentMethod: "PIX" }
[FreePay Webhook] Sending UTMFY notification: { orderId: "tx_123", status: "waiting_payment" }
[FreePay Webhook] UTMFY notification sent successfully: { status: 200 }
```

#### **Venda Aprovada:**
```
[FreePay Webhook] Starting UTMFY notification: { status: "paid", paymentMethod: "PIX" }
[FreePay Webhook] Sending UTMFY notification: { orderId: "tx_123", status: "paid" }
[FreePay Webhook] UTMFY notification sent successfully: { status: 200 }
```

#### **Pagamento Não-PIX (Ignorado):**
```
[FreePay Webhook] Skipping UTMFY notification - not PIX payment: CARD
```

### 🔍 **Tratamento de Erros:**

#### **Erro na API UTMFY:**
```
[FreePay Webhook] Error sending UTMFY notification: Error: UTMFY API error: 400 Bad Request
[FreePay Webhook] UTMFY notification failed for transaction: tx_123
```

#### **Erro de Rede:**
```
[FreePay Webhook] Error sending UTMFY notification: Error: fetch failed
[FreePay Webhook] UTMFY notification failed for transaction: tx_123
```

### ⚙️ **Configurações Opcionais:**

#### **Variáveis de Ambiente para UTM:**
```bash
UTM_SOURCE=facebook
UTM_CAMPAIGN=campanha_2024
UTM_MEDIUM=social
UTM_CONTENT=anuncio_1
UTM_TERM=instagram
```

### 🧪 **Teste Manual:**

#### **1. Testar Venda Pendente:**
```bash
curl -X POST "https://seu-dominio.com/api/freepay-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transaction",
    "data": {
      "id": "test_pending_123",
      "status": "waiting_payment",
      "amount": 26323,
      "customer": {
        "name": "Teste Pendente",
        "email": "teste@teste.com",
        "phone": "11999999999"
      },
      "paymentMethod": "PIX",
      "createdAt": "2024-01-15T10:25:00Z",
      "items": [{
        "title": "Produto Teste",
        "unitPrice": 26323,
        "quantity": 1,
        "externalRef": "test_pending_123"
      }]
    }
  }'
```

#### **2. Testar Venda Aprovada:**
```bash
curl -X POST "https://seu-dominio.com/api/freepay-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transaction",
    "data": {
      "id": "test_paid_123",
      "status": "paid",
      "amount": 26323,
      "customer": {
        "name": "Teste Aprovado",
        "email": "teste@teste.com",
        "phone": "11999999999"
      },
      "paymentMethod": "PIX",
      "createdAt": "2024-01-15T10:25:00Z",
      "paidAt": "2024-01-15T10:30:00Z",
      "items": [{
        "title": "Produto Teste",
        "unitPrice": 26323,
        "quantity": 1,
        "externalRef": "test_paid_123"
      }]
    }
  }'
```

### 📈 **Monitoramento:**

#### **Logs de Sucesso:**
- ✅ `UTMFY notification sent successfully`
- ✅ Status 200 da API UTMFY
- ✅ Resposta da UTMFY

#### **Logs de Erro:**
- ❌ `Error sending UTMFY notification`
- ❌ `UTMFY API error: 400/401/500`
- ❌ `UTMFY notification failed for transaction`

### 🎯 **Características da Implementação:**

1. **✅ Seguindo Documentação Oficial UTMFY**
2. **✅ Apenas PIX (conforme solicitado)**
3. **✅ Vendas Pendentes e Aprovadas**
4. **✅ Tratamento de Erros Robusto**
5. **✅ Logs Detalhados para Debug**
6. **✅ Não quebra o webhook principal**
7. **✅ Formatação de Data UTC Correta**
8. **✅ Mapeamento de Dados Completo**

---

**Status**: ✅ **IMPLEMENTADO E FUNCIONANDO**
**Última atualização**: Janeiro 2024
**Token UTMFY**: `IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq`
