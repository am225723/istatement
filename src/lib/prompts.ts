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
- Keep each version close in length: one to two sentences only.
- Use the same amount of detail in each version.
- Do not add long introductions or disclaimers.
- Do not say you filled in missing information.`;

export function buildIStatementPrompt(input: IStatementPromptInput) {
  const isRaw = input.builderMode === 'raw';

  if (isRaw) {
    return `You are a communication-writing assistant.

The user is using RAW MESSAGE mode. They may only provide the message they really want to say. Do not require a separate feeling, impact, situation, or request. Do not invent details. Infer only what is reasonably implied by the raw message and keep uncertainty brief.

Raw message:
${input.raw || '[none]'}

Tone: ${input.tone || 'empathetic'}
Firmness: ${input.firmness ?? 35}/100
Context: ${input.scenario || 'relationship'}

${FORMAT_RULES}

Return exactly this structure:

**Refined I-statement**
One clear I-statement based only on the raw message.

**Softer version**
One gentler version with the same core meaning.

**More direct version**
One clearer, firmer version with the same core meaning.

**Language to avoid**
Two short bullets naming wording that may sound blaming, absolute, or mind-reading.

**Assumptions to check**
One brief sentence naming what may be implied, using words like "may" or "might."

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
One clear I-statement using the user's structured fields.

**Softer version**
One gentler version with the same core meaning.

**More direct version**
One clearer, firmer version with the same core meaning.

**Language to avoid**
Two short bullets naming wording that may sound blaming, absolute, or mind-reading.

**Empathy mirror**
One sentence the other person might say back to show they understand.

**Next-step listening question**
One question that invites a constructive response.`;
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
