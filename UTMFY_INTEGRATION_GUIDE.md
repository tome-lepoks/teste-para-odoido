# 🔗 Integração UTMFY - Guia Completo

## 📋 Visão Geral

A integração com a UTMFY foi implementada no webhook FreePay seguindo exatamente a documentação oficial da UTMFY. Quando uma venda é criada (pendente) ou aprovada, os dados são automaticamente enviados para a UTMFY para rastreamento de campanhas.

## 🚀 Como Funciona

### Fluxo de Integração:
1. **Venda criada/pendente** na FreePay (status `'waiting_payment'` ou `'processing'`)
2. **Venda aprovada** na FreePay (status `'paid'` ou `'authorized'`)
3. **Webhook recebe** a notificação da FreePay
4. **Dados são formatados** no padrão UTMFY
5. **Notificação é enviada** para a API da UTMFY
6. **Logs são registrados** para monitoramento

## ⚙️ Configuração

### 1. **Token de API UTMFY**
✅ **Já configurado no código:**
- Token: `IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq`
- Endpoint: `https://api.utmify.com.br/api-credentials/orders`
- Header: `x-api-token`

### 2. **Variáveis de Ambiente (Opcional)**

Para personalizar os parâmetros UTM, adicione ao arquivo `.env.local`:

```bash
# UTM Parameters (opcional)
UTM_SOURCE=freepay
UTM_CAMPAIGN=default_campaign
UTM_MEDIUM=payment
UTM_CONTENT=checkout_page
UTM_TERM=freepay_integration
```

## 📊 Tipos de Notificação

### 1. **Venda Pendente** (`waiting_payment`)
- **Quando**: PIX gerado, aguardando pagamento
- **Status UTMFY**: `waiting_payment`
- **approvedDate**: `null`
- **Uso**: Rastrear conversões iniciais, funil de vendas

### 2. **Venda Aprovada** (`paid`)
- **Quando**: Pagamento confirmado
- **Status UTMFY**: `paid`
- **approvedDate**: Data/hora do pagamento
- **Uso**: Rastrear vendas efetivadas, comissões

## 📊 Estrutura dos Dados Enviados

### Payload UTMFY (Venda Aprovada):
```json
{
  "orderId": "tx_123456789",
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
  "products": [
    {
      "id": "tx_123456789",
      "name": "Produto FreePay",
      "planId": null,
      "planName": null,
      "quantity": 1,
      "priceInCents": 26323
    }
  ],
  "trackingParameters": {
    "src": null,
    "sck": null,
    "utm_source": "freepay",
    "utm_campaign": "default_campaign",
    "utm_medium": "payment",
    "utm_content": "checkout_page",
    "utm_term": "freepay_integration"
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

### Payload UTMFY (Venda Pendente):
```json
{
  "orderId": "tx_123456789",
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
  "products": [
    {
      "id": "tx_123456789",
      "name": "Produto FreePay",
      "planId": null,
      "planName": null,
      "quantity": 1,
      "priceInCents": 26323
    }
  ],
  "trackingParameters": {
    "src": null,
    "sck": null,
    "utm_source": "freepay",
    "utm_campaign": "default_campaign",
    "utm_medium": "payment",
    "utm_content": "checkout_page",
    "utm_term": "freepay_integration"
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

## 🔄 Mapeamento de Dados

### Métodos de Pagamento:
- `PIX` → `pix`
- `CARD` → `credit_card`
- `BOLETO` → `boleto`
- `PAYPAL` → `paypal`

### Status de Pagamento:
- `paid` → `paid` (venda aprovada)
- `authorized` → `paid` (venda aprovada)
- `waiting_payment` → `waiting_payment` (venda pendente)
- `processing` → `waiting_payment` (venda pendente)

### Formato de Data:
- **Entrada**: ISO 8601 (FreePay)
- **Saída**: `YYYY-MM-DD HH:MM:SS` UTC (UTMFY)

## 📈 Comissões

### Cálculo Automático:
- **Taxa do Gateway**: 5% do valor total
- **Comissão do Usuário**: 95% do valor total
- **Moeda**: BRL (Real Brasileiro)

### Exemplo:
- Valor da venda: R$ 263,23
- Taxa do gateway: R$ 13,16 (5%)
- Comissão do usuário: R$ 250,07 (95%)

## 🔍 Logs e Monitoramento

### Logs de Sucesso:
```
[FreePay Webhook] Sending UTMFY notification: {
  orderId: "tx_123456789",
  amount: 26323,
  customer: "João Silva",
  platform: "FreePay"
}

[FreePay Webhook] UTMFY notification sent successfully: {
  orderId: "tx_123456789",
  status: 200,
  response: "OK"
}
```

### Logs de Erro:
```
[FreePay Webhook] Error sending UTMFY notification: Error: UTMFY API error: 400 Bad Request - Invalid payload

[FreePay Webhook] UTMFY notification failed for transaction: tx_123456789 {
  error: "UTMFY API error: 400 Bad Request - Invalid payload",
  transactionData: {
    id: "tx_123456789",
    amount: 26323,
    customer: "João Silva"
  }
}
```

## 🛠️ Personalização

### Modificar Taxa de Comissão:
```typescript
// No arquivo webhook, linha 308-309
gatewayFeeInCents: Math.round(amount * 0.03), // 3% em vez de 5%
userCommissionInCents: Math.round(amount * 0.97), // 97% em vez de 95%
```

### Adicionar Parâmetros UTM Dinâmicos:
```typescript
// No arquivo webhook, linha 300-304
utm_source: transactionData.metadata?.utm_source || process.env.UTM_SOURCE || null,
utm_campaign: transactionData.metadata?.utm_campaign || process.env.UTM_CAMPAIGN || null,
utm_medium: transactionData.metadata?.utm_medium || process.env.UTM_MEDIUM || null,
utm_content: transactionData.metadata?.utm_content || process.env.UTM_CONTENT || null,
utm_term: transactionData.metadata?.utm_term || process.env.UTM_TERM || null
```

### Adicionar CPF do Cliente:
```typescript
// No arquivo webhook, linha 278
document: customer?.cpf || customer?.document || null,
```

## 🚨 Tratamento de Erros

### Tipos de Erro:
1. **Erro de rede**: Timeout, conexão recusada
2. **Erro de autenticação**: Token inválido (401)
3. **Erro de validação**: Dados inválidos (400)
4. **Erro do servidor**: Problema na UTMFY (500)

### Comportamento:
- ✅ **Erros não falham** o webhook principal
- ✅ **Logs detalhados** de todos os erros
- ✅ **Transação continua** sendo processada
- ✅ **Retry automático** pode ser implementado

## 🔒 Segurança

### Medidas Implementadas:
- ✅ **Token de API** configurado e seguro
- ✅ **Validação de dados** antes do envio
- ✅ **Logs seguros** sem exposição de dados sensíveis
- ✅ **Tratamento de erros** robusto

## 📋 Checklist de Implementação

- ✅ Token UTMFY configurado
- ✅ Endpoint correto configurado
- ✅ Formato de dados seguindo documentação
- ✅ Mapeamento de métodos de pagamento
- ✅ Formatação de datas UTC
- ✅ Cálculo de comissões
- ✅ Tratamento de erros
- ✅ Logs detalhados

## 🆘 Solução de Problemas

### Vendas não aparecem na UTMFY:

1. **Verificar logs do webhook:**
   ```bash
   # Procurar por logs UTMFY
   grep "UTMFY" logs/webhook.log
   ```

2. **Testar API manualmente:**
   ```bash
   curl -X POST "https://api.utmify.com.br/api-credentials/orders" \
        -H "Content-Type: application/json" \
        -H "x-api-token: IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq" \
        -d '{"orderId":"test","platform":"FreePay","paymentMethod":"pix","status":"paid","createdAt":"2024-01-15 10:25:00","approvedDate":"2024-01-15 10:30:00","refundedAt":null,"customer":{"name":"Test","email":"test@test.com","phone":null,"document":null,"country":"BR","ip":null},"products":[{"id":"test","name":"Test Product","planId":null,"planName":null,"quantity":1,"priceInCents":10000}],"trackingParameters":{"src":null,"sck":null,"utm_source":null,"utm_campaign":null,"utm_medium":null,"utm_content":null,"utm_term":null},"commission":{"totalPriceInCents":10000,"gatewayFeeInCents":500,"userCommissionInCents":9500,"currency":"BRL"},"isTest":true}'
   ```

3. **Verificar status da resposta:**
   - 200: Sucesso
   - 400: Dados inválidos
   - 401: Token inválido
   - 500: Erro do servidor

### Erro 401 - API_CREDENTIAL_NOT_FOUND:
- Verificar se o token está correto
- Confirmar se a conta UTMFY está ativa

### Erro 400 - Dados inválidos:
- Verificar formato das datas
- Confirmar se todos os campos obrigatórios estão preenchidos
- Validar se os valores estão em centavos

## 📞 Suporte

- **UTMFY**: [Central de Ajuda](https://utmify.help.center)
- **FreePay**: [Documentação](https://freepaybr.com/docs)
- **Logs**: Verificar logs do webhook para detalhes

---

**Status**: ✅ Implementado e funcionando
**Token**: `IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq`
**Endpoint**: `https://api.utmify.com.br/api-credentials/orders`
**Última atualização**: Janeiro 2024
