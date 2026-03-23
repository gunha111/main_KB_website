import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface DraftParams {
  subsidyTitle:   string
  subsidyContent: string
  bizName:        string
  bizType:        string
  bizRegion:      string
  bizSize:        string
}

export interface DraftResult {
  purpose:        string  // 신청 목적 (200자)
  currentStatus:  string  // 현황 및 필요성 (300자)
  usagePlan:      string  // 활용 계획 (300자)
  expectedEffect: string  // 기대 효과 (200자)
}

export async function generateDraft(params: DraftParams): Promise<DraftResult> {
  const prompt = `정부 지원사업 신청서 전문가로서 JSON만 반환해주세요. 다른 텍스트 없이.

지원사업: ${params.subsidyTitle}
공고내용: ${params.subsidyContent}
상호명: ${params.bizName}, 업종: ${params.bizType}, 지역: ${params.bizRegion}, 규모: ${params.bizSize}

{"purpose":"신청 목적(200자, 격식 공문체)","currentStatus":"현황 및 필요성(300자)","usagePlan":"활용 계획(300자, 구체적 수치)","expectedEffect":"기대 효과(200자, 수치 포함)"}`

  const message = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(text) as DraftResult
  } catch {
    throw new Error('AI 응답 JSON 파싱 실패: ' + text.slice(0, 100))
  }
}
