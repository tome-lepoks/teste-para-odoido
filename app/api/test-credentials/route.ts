import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Testar credenciais UNIPAY
    const UNIPAY_PUBLIC_KEY = "pk_b43b6992da8621f3940d675ed1a5f954091fb37e"
    const UNIPAY_SECRET_KEY = "sk_a0aab6155b590896932e3c92f49df02c59108c74"
    
    // Testar credenciais FREEPAY
    const FREEPAY_SECRET_KEY = "sk_live_C4C97UanuShcerwwfBIWYnTdqthmTrh2s5hYXBntPdb8q3bL"
    
    const unipayAuth = 'Basic ' + Buffer.from(UNIPAY_PUBLIC_KEY + ':' + UNIPAY_SECRET_KEY).toString('base64')
    const freepayAuth = 'Basic ' + Buffer.from(FREEPAY_SECRET_KEY + ':x').toString('base64')
    
    return NextResponse.json({
      success: true,
      credentials: {
        unipay: {
          publicKey: UNIPAY_PUBLIC_KEY,
          secretKey: UNIPAY_SECRET_KEY.substring(0, 10) + '...',
          authHeader: unipayAuth.substring(0, 20) + '...',
          url: 'https://api.fastsoftbrasil.com/api/user/transactions'
        },
        freepay: {
          secretKey: FREEPAY_SECRET_KEY.substring(0, 10) + '...',
          authHeader: freepayAuth.substring(0, 20) + '...',
          url: 'https://api.freepaybr.com/functions/v1/transactions'
        }
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor"
      },
      { status: 500 }
    )
  }
}
