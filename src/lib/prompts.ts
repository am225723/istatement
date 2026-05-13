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

const FORMAT_RULES = `Formatting rules:
- Use the exact section titles below, in the exact order.
- Put every section title on its own line.
- Wrap section titles in double asterisks, like **Refined I-statement**. The app will render them as bold.
- Do not use numbered section headings like 1., 2., or 3.
- Do not use markdown tables or pipe characters.
- Do not add a long introduction.
- Each statement version must be detailed: 2 to 3 sentences, or one long sentence plus a clear request.
- Each version should include: feeling or felt experience, situation, impact/meaning, and a concrete request when possible.
- Language to avoid must include 3 bullets, each with a short reason in parentheses.
- Keep all three statement versions similarly detailed and similarly long.
- Do not say you filled in missing information.`;

export function buildIStatementPrompt(input: IStatementPromptInput) {
  const isRaw = input.builderMode === 'raw';

  if (isRaw) {
    return `You are a communication-writing assistant.

The user is using RAW MESSAGE mode. They may only provide the message they really want to say. Do not require a separate feeling, impact, situation, or request. Do not invent facts. You may infer a likely feeling or impact only when it is strongly implied by the raw message, and you must phrase that inference naturally inside the statement rather than announcing that you filled it in.

Raw message:
${input.raw || '[none]'}

Tone: ${input.tone || 'empathetic'}
Firmness: ${input.firmness ?? 35}/100
Context: ${input.scenario || 'relationship'}

${FORMAT_RULES}

Return exactly this structure:

**Refined I-statement**
Write a detailed I-statement based only on the raw message. Include the feeling, situation, impact, and a concrete request when reasonably implied. Aim for 2 to 3 sentences.

**Softer version**
Write a gentler version with the same core meaning and similar detail. Aim for 2 to 3 sentences.

**More direct version**
Write a firmer, clearer version with the same core meaning and similar detail. Aim for 2 to 3 sentences.

**Language to avoid**
Provide exactly 3 bullets. Each bullet should name a phrase or pattern to avoid and include a reason in parentheses.

**Empathy mirror**
Write one sentence the other person might say back to show they understand.

**Next-step listening question**
Write one open-ended question that invites a constructive response.

**Follow-up question**
Is this the message you were trying to say? If not, tell me what I missed or what you want it to sound like.`;
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

${FORMAT_RULES}

Return exactly this structure:

**Refined I-statement**
Write a detailed I-statement using the user's structured fields. Include feeling, situation, impact, and request. Aim for 2 to 3 sentences.

**Softer version**
Write a gentler version with the same core meaning and similar detail. Aim for 2 to 3 sentences.

**More direct version**
Write a firmer, clearer version with the same core meaning and similar detail. Aim for 2 to 3 sentences.

**Language to avoid**
Provide exactly 3 bullets. Each bullet should name a phrase or pattern to avoid and include a reason in parentheses.

**Empathy mirror**
Write one sentence the other person might say back to show they understand.

**Next-step listening question**
Write one open-ended question that invites a constructive response.`;
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

Formatting rules:
- Put every section title on its own line.
- Wrap section titles in double asterisks, like **Scared**. The app will render them as bold.
- Do not use markdown tables or pipe characters.
- Keep each section concise and balanced.

Return exactly this structure:

**Scared**
What threat may be underneath the reaction.

**Embarrassed**
Where the user may feel exposed, judged, or ashamed.

**Expectations**
What expectation may have been violated.

**Need**
What the user may need to move forward.

**Clarifying questions**
Three short questions that would help the user go deeper.

**SEEN-based I-statement**
One concise I-statement created from the SEEN insight.

**Regulated next step**
One grounded action the user can take next.

Do not diagnose. Do not overstate certainty. Use practical, emotionally intelligent language.`;
}
