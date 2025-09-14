import { webhookApiClient } from '@/lib/webhook-api'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)
    
    // Extrair signature do header (se necessário)
    const signature = request.headers.get('x-nivuspay-signature') || 
                     request.headers.get('x-signature') ||
                     request.headers.get('signature')
    
    // Log do webhook recebido para debug
    console.log('Webhook Nivuspay recebido:', payload)
    console.log('Signature recebida:', signature)
    
    const result = await webhookApiClient.processWebhook(
      'nivuspay',
      payload,
      signature || undefined
    )

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: result.message }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: result.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Erro no webhook do Nivuspay:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
