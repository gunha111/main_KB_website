import { SolapiMessageService } from 'solapi'

const TEMPLATE_MAP = {
  d14: process.env.SOLAPI_TEMPLATE_D14 ?? '',
  d7:  process.env.SOLAPI_TEMPLATE_D7  ?? '',
  d3:  process.env.SOLAPI_TEMPLATE_D3  ?? '',
} as const

export interface AlimtalkMessage {
  to: string
  templateType: 'd14' | 'd7' | 'd3'
  variables: {
    subsidyTitle:  string
    agencyName:    string
    endDate:       string  // "YYYY년 MM월 DD일"
    detailUrl:     string
    supportAmount: string
  }
}

export interface SendResult {
  success: boolean
  to: string
  error?: string
}

function getService() {
  return new SolapiMessageService(
    process.env.SOLAPI_API_KEY!,
    process.env.SOLAPI_API_SECRET!
  )
}

export async function sendAlimtalk(msg: AlimtalkMessage): Promise<SendResult> {
  try {
    const service = getService()
    await service.send({
      to:          msg.to,
      from:        process.env.SOLAPI_PFID!,
      kakaoOptions: {
        pfId:       process.env.SOLAPI_PFID!,
        templateId: TEMPLATE_MAP[msg.templateType],
        variables:  msg.variables,
        disableSms: false, // 카카오 실패 시 SMS 대체 발송
      },
    })
    return { success: true, to: msg.to }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return { success: false, to: msg.to, error }
  }
}

// 1,000건씩 청크로 순차 발송
export async function sendBulkAlimtalk(messages: AlimtalkMessage[]): Promise<SendResult[]> {
  const CHUNK = 1000
  const results: SendResult[] = []

  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK)
    const chunkResults = await Promise.all(chunk.map(sendAlimtalk))
    results.push(...chunkResults)
  }

  return results
}
