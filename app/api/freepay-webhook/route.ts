import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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
    // Enviar notificação para UTMFY (venda aprovada)
    await sendUTMFYNotification(transactionData, 'paid')
    
    // Simular envio de email de confirmação
    console.log("[FreePay Webhook] Sending confirmation email to:", transactionData.customer?.email)
    
    // Simular atualização de banco de dados
    console.log("[FreePay Webhook] Updating database for transaction:", transactionData.id)
    
    // Simular liberação de produto
    console.log("[FreePay Webhook] Releasing product for customer:", transactionData.customer?.name)
    
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
    // Enviar notificação para UTMFY (venda pendente)
    await sendUTMFYNotification(transactionData, 'waiting_payment')
    
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

// ===== INTEGRAÇÃO COM UTMFY =====

/**
 * Envia notificação de venda para a UTMFY seguindo a documentação oficial
 * Apenas para vendas pendentes (waiting_payment) e aprovadas (paid) via PIX
 */
async function sendUTMFYNotification(transactionData: any, status: 'waiting_payment' | 'paid') {
  const { id, amount, customer, paidAt, paymentMethod, items, createdAt, updatedAt } = transactionData
  
  console.log("[FreePay Webhook] Starting UTMFY notification:", {
    transactionId: id,
    status: status,
    amount: amount,
    customer: customer?.name,
    paymentMethod: paymentMethod
  })
  
  // Verificar se é PIX (apenas PIX é enviado para UTMFY)
  if (paymentMethod !== 'PIX') {
    console.log("[FreePay Webhook] Skipping UTMFY notification - not PIX payment:", paymentMethod)
    return
  }
  
  try {
    // Preparar dados para UTMFY seguindo a documentação oficial
    const utmfyPayload = {
      orderId: id,
      platform: "FreePay",
      paymentMethod: "pix", // Sempre PIX conforme especificado
      status: status,
      createdAt: formatDateForUTMFY(createdAt),
      approvedDate: status === 'paid' ? formatDateForUTMFY(paidAt) : null,
      refundedAt: null,
      customer: {
        name: customer?.name || "Cliente",
        email: customer?.email || "",
        phone: customer?.phone || null,
        document: null, // CPF não disponível no FreePay
        country: "BR",
        ip: null
      },
      products: items?.map((item: any) => ({
        id: item.externalRef || id,
        name: item.title || "Produto FreePay",
        planId: null,
        planName: null,
        quantity: item.quantity || 1,
        priceInCents: item.unitPrice || amount
      })) || [{
        id: id,
        name: "Produto FreePay",
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: amount
      }],
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: process.env.UTM_SOURCE || null,
        utm_campaign: process.env.UTM_CAMPAIGN || null,
        utm_medium: process.env.UTM_MEDIUM || null,
        utm_content: process.env.UTM_CONTENT || null,
        utm_term: process.env.UTM_TERM || null
      },
      commission: {
        totalPriceInCents: amount,
        gatewayFeeInCents: Math.round(amount * 0.05), // Estimativa de 5% de taxa
        userCommissionInCents: Math.round(amount * 0.95), // 95% para o usuário
        currency: "BRL"
      },
      isTest: false
    }
    
    console.log("[FreePay Webhook] Sending UTMFY notification:", {
      orderId: id,
      amount: amount,
      customer: customer?.name,
      platform: "FreePay",
      status: status,
      paymentMethod: "pix"
    })
    
    console.log("[FreePay Webhook] UTMFY payload:", JSON.stringify(utmfyPayload, null, 2))
    
    // Enviar para UTMFY seguindo a documentação oficial
    const response = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": "IvzcwicXzvD9wEZvc3A8VCGJlxTfdz9J2gXq"
      },
      body: JSON.stringify(utmfyPayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`UTMFY API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const responseData = await response.text()
    console.log("[FreePay Webhook] UTMFY notification sent successfully:", {
      orderId: id,
      status: response.status,
      response: responseData
    })
    
  } catch (error) {
    console.error("[FreePay Webhook] Error sending UTMFY notification:", error)
    
    // Log do erro mas não falha o webhook principal
    console.error("[FreePay Webhook] UTMFY notification failed for transaction:", id, {
      error: error instanceof Error ? error.message : String(error),
      transactionData: {
        id,
        amount,
        customer: customer?.name,
        paymentMethod: paymentMethod
      }
    })
  }
}

/**
 * Formata data para o formato esperado pela UTMFY (YYYY-MM-DD HH:MM:SS UTC)
 */
function formatDateForUTMFY(dateString: string): string | null {
  if (!dateString) return null
  
  const date = new Date(dateString)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
