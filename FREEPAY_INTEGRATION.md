# FreePay API Integration

Esta documentação descreve como usar a integração da FreePay implementada neste projeto.

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# FreePay API Configuration
FREEPAY_SECRET_KEY=sk_live_m3uStaWdyxbBEazrhZp9vzlQMd26rIPv9XUttVnhWXu7EOrm
FREEPAY_COMPANY_ID=f47a370a-6bda-4bb7-8b1b-f020790c7d7e

# Base URL for webhooks (update with your actual domain)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Endpoints Disponíveis

### 1. Criar Transação PIX

**POST** `/api/freepay-pix`

Cria uma nova transação PIX na FreePay.

#### Parâmetros de Entrada

```json
{
  "amount": 199.93,
  "cpf": "12345678901",
  "name": "João Silva",
  "phone": "11999999999",
  "email": "joao@email.com",
  "description": "Pagamento de produto",
  "items": [
    {
      "title": "Produto 1",
      "unitPrice": 19993,
      "quantity": 1,
      "externalRef": "PROD001"
    }
  ]
}
```

#### Resposta de Sucesso

```json
{
  "success": true,
  "pixCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=...",
  "amount": 199.93,
  "transactionId": "c856345e-23d6-471d-bb7e-75dfe340c26d",
  "expiresAt": "2024-08-09T11:11:07.144-03:00",
  "provider": "freepay",
  "status": "waiting_payment",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999"
  },
  "transaction": {
    "id": "c856345e-23d6-471d-bb7e-75dfe340c26d",
    "amount": 19993,
    "status": "waiting_payment",
    "paymentMethod": "PIX",
    "createdAt": "2024-08-09T10:51:07.144-03:00",
    "updatedAt": "2024-08-09T10:51:07.144-03:00"
  }
}
```

### 2. Consultar Status da Transação

**GET** `/api/freepay-status?transactionId={id}`

Consulta o status atual de uma transação.

#### Parâmetros

- `transactionId` (query string): ID da transação

#### Resposta de Sucesso

```json
{
  "success": true,
  "transaction": {
    "id": "c856345e-23d6-471d-bb7e-75dfe340c26d",
    "status": "paid",
    "amount": 19993,
    "paidAmount": 19993,
    "refundedAmount": null,
    "paymentMethod": "PIX",
    "createdAt": "2024-08-09T10:51:07.144-03:00",
    "updatedAt": "2024-08-09T10:51:07.144-03:00",
    "paidAt": "2024-08-09T10:55:30.144-03:00",
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999"
    }
  },
  "payment": {
    "isPaid": true,
    "isWaiting": false,
    "isRefused": false,
    "isRefunded": false,
    "isCanceled": false,
    "statusText": "Pago"
  },
  "provider": "freepay"
}
```

### 3. Webhook para Postbacks

**POST** `/api/freepay-webhook`

Endpoint para receber notificações de mudança de status das transações.

#### Payload do Webhook

```json
{
  "id": "XDOH3YTF9GER",
  "type": "transaction",
  "objectId": "c856345e-23d6-471d-bb7e-75dfe340c26d",
  "data": {
    "id": "c856345e-23d6-471d-bb7e-75dfe340c26d",
    "amount": 19993,
    "status": "paid",
    "paymentMethod": "PIX",
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999"
    },
    "pix": {
      "qrcode": "00020126580014br.gov.bcb.pix...",
      "expirationDate": "2024-08-09T11:11:07.144-03:00"
    },
    "createdAt": "2024-08-09T10:51:07.144-03:00",
    "updatedAt": "2024-08-09T10:55:30.144-03:00",
    "paidAt": "2024-08-09T10:55:30.144-03:00"
  }
}
```

## Status de Transação

| Status | Descrição | Tradução |
|--------|-----------|----------|
| `processing` | Processando | Processando |
| `authorized` | Autorizado | Autorizado |
| `paid` | Pago | Pago |
| `refunded` | Estornado | Estornado |
| `waiting_payment` | Aguardando Pagamento | Aguardando Pagamento |
| `refused` | Recusado | Recusado |
| `chargedback` | Chargeback | Chargeback |
| `canceled` | Cancelado | Cancelado |
| `in_protest` | Em Protesto | Em Protesto |
| `partially_paid` | Parcialmente Pago | Parcialmente Pago |

## Cliente FreePay

O projeto inclui uma biblioteca cliente em `lib/freepay.ts` que facilita o uso da API:

```typescript
import { FreePayClient } from '@/lib/freepay'

const client = new FreePayClient({
  secretKey: process.env.FREEPAY_SECRET_KEY!,
  companyId: process.env.FREEPAY_COMPANY_ID!
})

// Criar transação PIX
const result = await client.createPixTransaction({
  amount: 19993, // em centavos
  customer: {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999'
  },
  description: 'Pagamento de produto'
})

if (result.success) {
  console.log('Transação criada:', result.data)
} else {
  console.error('Erro:', result.error)
}
```

## Exemplos de Uso

### Frontend (React/Next.js)

```typescript
// Criar transação PIX
const createPixPayment = async (paymentData: any) => {
  try {
    const response = await fetch('/api/freepay-pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()
    
    if (result.success) {
      // Exibir QR Code
      setQrCode(result.qrCodeImage)
      setPixCode(result.pixCode)
      setTransactionId(result.transactionId)
    } else {
      console.error('Erro ao criar pagamento:', result.error)
    }
  } catch (error) {
    console.error('Erro na requisição:', error)
  }
}

// Verificar status da transação
const checkPaymentStatus = async (transactionId: string) => {
  try {
    const response = await fetch(`/api/freepay-status?transactionId=${transactionId}`)
    const result = await response.json()
    
    if (result.success) {
      const { payment } = result
      
      if (payment.isPaid) {
        console.log('Pagamento confirmado!')
        // Redirecionar para página de sucesso
      } else if (payment.isRefused) {
        console.log('Pagamento recusado')
        // Mostrar erro
      } else if (payment.isWaiting) {
        console.log('Aguardando pagamento...')
        // Continuar aguardando
      }
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error)
  }
}
```

### Backend (Node.js/Express)

```typescript
import { FreePayClient } from './lib/freepay'

const freepay = new FreePayClient({
  secretKey: process.env.FREEPAY_SECRET_KEY!,
  companyId: process.env.FREEPAY_COMPANY_ID!
})

// Criar transação
app.post('/create-payment', async (req, res) => {
  try {
    const { amount, customer } = req.body
    
    const result = await freepay.createPixTransaction({
      amount: amount * 100, // converter para centavos
      customer,
      description: 'Pagamento via API'
    })
    
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.data?.id,
        pixCode: result.data?.pix?.qrcode,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(result.data?.pix?.qrcode || '')}`
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
})

// Webhook handler
app.post('/webhook/freepay', async (req, res) => {
  try {
    const payload = req.body
    
    // Validar payload
    const webhookData = freepay.parseWebhookPayload(payload)
    if (!webhookData) {
      return res.status(400).json({ error: 'Payload inválido' })
    }
    
    const { data: transaction } = webhookData
    
    // Processar baseado no status
    switch (transaction.status) {
      case 'paid':
        // Pagamento confirmado
        await handlePaidTransaction(transaction)
        break
      case 'refused':
        // Pagamento recusado
        await handleRefusedTransaction(transaction)
        break
      case 'refunded':
        // Estorno
        await handleRefundedTransaction(transaction)
        break
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    res.status(500).json({ error: 'Erro interno' })
  }
})
```

## Configuração do Webhook

Para receber notificações de mudança de status, configure a URL do webhook na FreePay:

1. Acesse o painel da FreePay
2. Vá em Configurações → Webhooks
3. Adicione a URL: `https://seu-dominio.com/api/freepay-webhook`

## Tratamento de Erros

Todos os endpoints retornam respostas padronizadas:

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "provider": "freepay",
  "timestamp": "2024-08-09T10:51:07.144-03:00"
}
```

## Logs e Debugging

O sistema inclui logs detalhados para facilitar o debugging:

- `[FreePay]` - Logs gerais da API
- `[FreePay Webhook]` - Logs específicos do webhook
- Todos os erros são logados com stack trace completo

## Segurança

- As chaves da API são armazenadas em variáveis de ambiente
- O webhook não inclui validação de assinatura (FreePay não fornece)
- Todas as requisições são logadas para auditoria
- Validação de entrada em todos os endpoints

## Limitações

- FreePay não fornece validação de assinatura para webhooks
- Alguns campos são obrigatórios mesmo que não sejam utilizados
- O sistema usa valores padrão para campos opcionais

## Suporte

Para dúvidas sobre a integração, consulte:
- Documentação oficial da FreePay
- Logs do sistema para debugging
- Código fonte dos endpoints implementados
