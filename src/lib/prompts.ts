export function buildIStatementPrompt(input: {
  raw: string;
  feeling: string;
  situation: string;
  because: string;
  request: string;
  tone: string;
  scenario: string;
  firmness: number;
}) {
  return `You are a communication-writing assistant.

Create a refined I-statement for this context.
Scenario: ${input.scenario}
Tone: ${input.tone}
Firmness: ${input.firmness}/100
Raw statement: ${input.raw || '[none]'}
Feeling: ${input.feeling || '[not provided]'}
Situation: ${input.situation || '[not provided]'}
Because/impact: ${input.because || '[not provided]'}
Request: ${input.request || '[not provided]'}

Return:
1. Refined I-statement
2. Softer version
3. More direct version
4. Vague or blaming language to avoid
5. One empathy mirror sentence
6. One next-step listening question

Use warm, practical, non-shaming language.`;
}
