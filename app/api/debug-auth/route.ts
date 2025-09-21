import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()
    
    if (!provider || !['unipay', 'freepay'].includes(provider)) {
      return NextResponse.json({ 
        success: false, 
        error: "Provider deve ser 'unipay' ou 'freepay'" 
      }, { status: 400 })
    }

    console.log(`[DEBUG] Testing ${provider} authentication`)

    let url: string
    let auth: string
    let testPayload: any

    if (provider === 'unipay') {
      const UNIPAY_PUBLIC_KEY = "pk_b43b6992da8621f3940d675ed1a5f954091fb37e"
      const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"
      
      url = 'https://api.fastsoftbrasil.com/api/user/transactions'
      auth = 'Basic ' + Buffer.from(UNIPAY_PUBLIC_KEY + ':' + UNIPAY_SECRET_KEY).toString('base64')
      
      testPayload = {
        amount: 26323,
        currency: "BRL",
        paymentMethod: "PIX",
        customer: {
          name: "Teste Usuario",
          email: "teste@temp.com",
          document: {
            number: "12345678900",
            type: "CPF"
          },
          phone: "11999999999",
          address: {
            street: "Rua Exemplo",
            streetNumber: "123",
            complement: "Apto 1",
            zipCode: "12345678",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            country: "BR"
          }
        },
        items: [{
          title: "Produto005",
          unitPrice: 26323,
          quantity: 1,
          tangible: true,
          externalRef: "PRODUTO005_TESTE"
        }],
        pix: {
          expiresInDays: 1
        }
      }
    } else {
      const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
      
      url = 'https://api.freepaybr.com/functions/v1/transactions'
      auth = 'Basic ' + Buffer.from(FREEPAY_SECRET_KEY + ':x').toString('base64')
      
      testPayload = {
        paymentMethod: 'PIX',
        amount: 26323,
        items: [{
          title: 'Produto005',
          unitPrice: 26323,
          quantity: 1,
          externalRef: 'PRODUTO005_TESTE'
        }],
        customer: {
          document: { number: '12345678900' },
          name: 'Teste Usuario',
          email: 'teste@temp.com',
          phone: '11999999999'
        },
        shipping: {
          street: 'Rua Exemplo',
          streetNumber: '123',
          zipCode: '12345678',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          complement: 'Apto 1'
        },
        description: 'Pagamento de teste'
      }
    }

    console.log(`[DEBUG] URL: ${url}`)
    console.log(`[DEBUG] Auth: ${auth.substring(0, 20)}...`)
    console.log(`[DEBUG] Payload:`, JSON.stringify(testPayload, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log(`[DEBUG] Response Status: ${response.status}`)
    console.log(`[DEBUG] Response Body: ${responseText}`)

    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      parsedResponse = { raw: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      provider,
      status: response.status,
      statusText: response.statusText,
      response: parsedResponse,
      debug: {
        url,
        authHeader: auth.substring(0, 20) + '...',
        payloadSize: JSON.stringify(testPayload).length
      }
    })

  } catch (error) {
    console.error("[DEBUG] Error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
