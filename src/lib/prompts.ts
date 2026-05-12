export type IStatementPromptInput = {
  raw?: string;
  feeling?: string;
  situation?: string;
  because?: string;
  request?: string;
  tone?: string;
  scenario?: string;
  firmness?: number;
  builderMode?: 'structured' | 'raw';
};

export function buildIStatementPrompt(input: IStatementPromptInput) {
  const isRaw = input.builderMode === 'raw';

  if (isRaw) {
    return `You are a communication-writing assistant.

The user is using RAW MESSAGE mode. They may only provide the message they really want to say. Do not require a separate feeling, impact, situation, or request. Do not tell the user you filled in missing information. Do not invent details. Only infer lightly from the words they provided, and keep uncertainty visible.

Raw message:
${input.raw || '[none]'}

Tone: ${input.tone || 'empathetic'}
Firmness: ${input.firmness ?? 35}/100
Context: ${input.scenario || 'relationship'}

Return:
1. A grounded I-statement based only on the raw message.
2. A softer version.
3. A more direct version.
4. A brief note naming any assumptions as possibilities, not facts.
5. Ask: "Is this the message you were trying to say? If not, tell me what I missed or what you want it to sound like."

Keep the language warm, practical, and non-shaming.`;
  }

  return `You are a communication-writing assistant.

Create a refined I-statement for this structured context.
Scenario: ${input.scenario || 'relationship'}
Tone: ${input.tone || 'empathetic'}
Firmness: ${input.firmness ?? 35}/100
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

export function buildSeenPrompt(input: { situation?: string; reaction?: string; desiredOutcome?: string }) {
  return `You are a reflective communication assistant using the SEEN method.

Analyze the user's situation through this framework:
S - Scared: What threat might I be perceiving right now?
E - Embarrassed: Am I feeling exposed, judged, or ashamed of my reaction?
E - Expectations: What did I expect to happen, and how does that differ from what is happening?
N - Need: What do I need right now to move forward?

User's situation:
${input.situation || '[not provided]'}

User's reaction:
${input.reaction || '[not provided]'}

Desired outcome:
${input.desiredOutcome || '[not provided]'}

Return:
1. A compassionate SEEN breakdown with Scared, Embarrassed, Expectations, and Need.
2. Three clarifying questions that would help the user go deeper.
3. A concise I-statement created from the SEEN insight.
4. One regulated next step.

Do not diagnose. Do not overstate certainty. Use practical, emotionally intelligent language.`;
}
