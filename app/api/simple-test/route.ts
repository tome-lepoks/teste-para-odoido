import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Teste simples de conectividade
    const tests = []
    
    // Teste 1: UNIPAY - apenas verificar se a URL responde
    try {
      const unipayResponse = await fetch('https://api.unipaybr.com/api', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      tests.push({
        provider: 'unipay',
        url: 'https://api.unipaybr.com/api',
        status: unipayResponse.status,
        statusText: unipayResponse.statusText,
        accessible: unipayResponse.status < 500
      })
    } catch (error) {
      tests.push({
        provider: 'unipay',
        url: 'https://api.unipaybr.com/api',
        error: error instanceof Error ? error.message : 'Unknown error',
        accessible: false
      })
    }
    
    // Teste 2: FREEPAY - apenas verificar se a URL responde
    try {
      const freepayResponse = await fetch('https://api.freepaybr.com/functions/v1/transactions', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      tests.push({
        provider: 'freepay',
        url: 'https://api.freepaybr.com/functions/v1/transactions',
        status: freepayResponse.status,
        statusText: freepayResponse.statusText,
        accessible: freepayResponse.status < 500
      })
    } catch (error) {
      tests.push({
        provider: 'freepay',
        url: 'https://api.freepaybr.com/functions/v1/transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
        accessible: false
      })
    }
    
    return NextResponse.json({
      success: true,
      tests,
      timestamp: new Date().toISOString()
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
