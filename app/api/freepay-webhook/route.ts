import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[FreePay Webhook] ===== WEBHOOK CHAMADO PELA FREEPAY =====")
  console.log("[FreePay Webhook] Timestamp:", new Date().toISOString())
  console.log("[FreePay Webhook] URL:", request.url)
  console.log("[FreePay Webhook] Method:", request.method)
  
  try {
    const body = await request.json()
    
    console.log("[FreePay Webhook] Received postback:", JSON.stringify(body, null, 2))

    // Validar se é um postback válido da FreePay
    if (!body.type || body.type !== 'transaction') {
      console.log("[FreePay Webhook] Invalid postback type:", body.type)
      return NextResponse.json({ 
        success: false, 
        error: "Tipo de postback inválido" 
      }, { status: 400 })
    }

    if (!body.data || !body.data.id) {
      console.log("[FreePay Webhook] Missing transaction data or ID")
      return NextResponse.json({ 
        success: false, 
        error: "Dados da transação inválidos" 
      }, { status: 400 })
    }

    const transactionData = body.data
    const transactionId = transactionData.id
    const status = transactionData.status
    const amount = transactionData.amount
    const paidAmount = transactionData.paidAmount
    const customer = transactionData.customer
    const paymentMethod = transactionData.paymentMethod
    const createdAt = transactionData.createdAt
    const updatedAt = transactionData.updatedAt
    const paidAt = transactionData.paidAt
    const refusedReason = transactionData.refusedReason

    console.log("[FreePay Webhook] Processing transaction:", {
      id: transactionId,
      status: status,
      amount: amount,
      paidAmount: paidAmount,
      paymentMethod: paymentMethod,
      customer: customer?.name,
      paidAt: paidAt
    })

    // Processar diferentes status de transação
    switch (status) {
      case 'paid':
      case 'authorized':
        await handlePaidTransaction(transactionData)
        break
        
      case 'refused':
        await handleRefusedTransaction(transactionData)
        break
        
      case 'refunded':
        await handleRefundedTransaction(transactionData)
        break
        
      case 'canceled':
        await handleCanceledTransaction(transactionData)
        break
        
      case 'waiting_payment':
      case 'processing':
        await handleWaitingTransaction(transactionData)
        break
        
      default:
        console.log("[FreePay Webhook] Unknown status:", status)
        await handleUnknownStatus(transactionData)
    }

    // Log da atualização para auditoria
    console.log("[FreePay Webhook] Transaction updated successfully:", {
      transactionId: transactionId,
      status: status,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: "Postback processado com sucesso",
      transactionId: transactionId,
      status: status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("[FreePay Webhook] Error processing postback:", error)
    
    if (error instanceof Error) {
      console.error("[FreePay Webhook] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Funções para processar diferentes status de transação
async function handlePaidTransaction(transactionData: any) {
  console.log("[FreePay Webhook] Transaction PAID:", {
    id: transactionData.id,
    amount: transactionData.amount,
    paidAmount: transactionData.paidAmount,
    customer: transactionData.customer?.name,
    paidAt: transactionData.paidAt
  })
  
  // Aqui você pode implementar lógica específica para transações pagas:
  // - Enviar email de confirmação
  // - Atualizar banco de dados
  // - Liberar produto/serviço
  // - Enviar notificação push
  // - Integrar com sistema de estoque
  
  // Exemplo de integração com sistema externo
  try {
    // Simular envio de email de confirmação
    console.log("[FreePay Webhook] Sending confirmation email to:", transactionData.customer?.email)
    
    // Simular atualização de banco de dados
    console.log("[FreePay Webhook] Updating database for transaction:", transactionData.id)
    
    // Simular liberação de produto
    console.log("[FreePay Webhook] Releasing product for customer:", transactionData.customer?.name)
    
    // TRACKING DE CONVERSÃO META PIXEL
    await sendMetaConversionTracking(transactionData)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in paid transaction processing:", error)
  }
}

async function handleRefusedTransaction(transactionData: any) {
  console.log("[FreePay Webhook] Transaction REFUSED:", {
    id: transactionData.id,
    amount: transactionData.amount,
    refusedReason: transactionData.refusedReason,
    customer: transactionData.customer?.name
  })
  
  // Lógica para transações recusadas:
  // - Notificar cliente sobre a recusa
  // - Sugerir método de pagamento alternativo
  // - Registrar motivo da recusa para análise
  
  try {
    console.log("[FreePay Webhook] Notifying customer about refused payment")
    console.log("[FreePay Webhook] Refused reason:", transactionData.refusedReason)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in refused transaction processing:", error)
  }
}

async function handleRefundedTransaction(transactionData: any) {
  console.log("[FreePay Webhook] Transaction REFUNDED:", {
    id: transactionData.id,
    amount: transactionData.amount,
    refundedAmount: transactionData.refundedAmount,
    customer: transactionData.customer?.name
  })
  
  // Lógica para estornos:
  // - Notificar cliente sobre o estorno
  // - Reverter liberação de produto/serviço
  // - Atualizar relatórios financeiros
  
  try {
    console.log("[FreePay Webhook] Processing refund for transaction:", transactionData.id)
    console.log("[FreePay Webhook] Refunded amount:", transactionData.refundedAmount)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in refunded transaction processing:", error)
  }
}

// Função para enviar tracking de conversão para o Meta Pixel
async function sendMetaConversionTracking(transactionData: any) {
  try {
    console.log("[FreePay Webhook] Enviando tracking de conversão para Meta Pixel...")
    
    // Extrair dados do cliente da transação
    const customer = transactionData.customer
    const amount = transactionData.amount / 100 // Converter de centavos para reais
    
    // Preparar dados para o tracking
    const trackingData = {
      email: customer?.email || '',
      phone: customer?.phone || '',
      firstName: customer?.name?.split(' ')[0] || '',
      lastName: customer?.name?.split(' ').slice(1).join(' ') || '',
      city: 'São Paulo',
      state: 'SP',
      zip: '00000-000',
      country: 'BR',
      externalId: transactionData.id
    }
    
    // Gerar event_id único
    const eventId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Preparar dados do evento
    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: process.env.NEXT_PUBLIC_BASE_URL || 'https://e34asd.netlify.app',
      action_source: "website",
      user_data: {
        em: await hashData(trackingData.email),
        ph: await hashData(trackingData.phone),
        fn: await hashData(trackingData.firstName),
        ln: await hashData(trackingData.lastName),
        ct: await hashData(trackingData.city),
        st: await hashData(trackingData.state),
        zp: await hashData(trackingData.zip),
        country: await hashData(trackingData.country),
        external_id: trackingData.externalId
      },
      custom_data: {
        value: amount,
        currency: 'BRL',
        content_type: 'product',
        content_name: 'Regularização DARF'
      }
    }
    
    console.log("[FreePay Webhook] Evento Purchase preparado:", eventData)
    
    // Enviar para UTMFY/Meta Pixel
    const response = await fetch('https://api.utmify.com.br/api-credentials/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': 'IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq'
      },
      body: JSON.stringify(eventData)
    })
    
    if (response.ok) {
      console.log("[FreePay Webhook] ✅ Evento Purchase enviado com sucesso para Meta Pixel")
    } else {
      console.error("[FreePay Webhook] ❌ Erro ao enviar evento Purchase:", response.status)
    }
    
  } catch (error) {
    console.error("[FreePay Webhook] ❌ Erro no tracking de conversão:", error)
  }
}

// Função para hashear dados com SHA-256
async function hashData(data: string) {
  if (!data) return ''
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function handleCanceledTransaction(transactionData: any) {
  console.log("[FreePay Webhook] Transaction CANCELED:", {
    id: transactionData.id,
    amount: transactionData.amount,
    customer: transactionData.customer?.name
  })
  
  // Lógica para transações canceladas:
  // - Liberar recursos reservados
  // - Notificar cliente se necessário
  // - Atualizar estoque se aplicável
  
  try {
    console.log("[FreePay Webhook] Processing cancellation for transaction:", transactionData.id)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in canceled transaction processing:", error)
  }
}

async function handleWaitingTransaction(transactionData: any) {
  console.log("[FreePay Webhook] Transaction WAITING/PROCESSING:", {
    id: transactionData.id,
    status: transactionData.status,
    amount: transactionData.amount,
    customer: transactionData.customer?.name
  })
  
  // Lógica para transações em espera/processamento:
  // - Atualizar status no sistema
  // - Enviar lembretes se necessário
  // - Monitorar tempo de expiração
  
  try {
    console.log("[FreePay Webhook] Transaction is waiting for payment:", transactionData.id)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in waiting transaction processing:", error)
  }
}

async function handleUnknownStatus(transactionData: any) {
  console.log("[FreePay Webhook] Transaction with UNKNOWN STATUS:", {
    id: transactionData.id,
    status: transactionData.status,
    amount: transactionData.amount,
    customer: transactionData.customer?.name
  })
  
  // Lógica para status desconhecidos:
  // - Log para análise
  // - Notificar administradores
  // - Investigar com suporte da FreePay
  
  try {
    console.log("[FreePay Webhook] Unknown status requires investigation:", transactionData.status)
    
  } catch (error) {
    console.error("[FreePay Webhook] Error in unknown status processing:", error)
  }
}
