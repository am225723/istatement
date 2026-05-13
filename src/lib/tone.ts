export type ToneResult = {
  tone: string;
  confidence: number;
  zone: 'green' | 'yellow' | 'red';
  color: string;
  description: string;
  repairCue: string;
};

export const TONE_COLORS: Record<string, string> = {
  calm: '#AEC6CF', reassuring: '#77AADD', empathetic: '#66CDAA', compassionate: '#98FB98', cooperative: '#5DBB63', curious: '#FDFD96', assertive: '#FFD700',
  anxious: '#FFA500', impatient: '#FF8C00', sad: '#6B8E9F', angry: '#CD5C5C', frustrated: '#FF7F50', defensive: '#D2691E',
  'passive-aggressive': '#E09F3E', sarcastic: '#DAA520', dismissive: '#FF6347', judgmental: '#FF4500', blaming: '#FF0000', confrontational: '#DC143C', aggressive: '#B22222', hostile: '#8B0000', neutral: '#B0B0B0'
};

export const TONE_DESCRIPTIONS: Record<string, string> = {
  calm: 'Soft, steady', reassuring: 'Stable, supportive', empathetic: 'Understanding, gentle', compassionate: 'Caring, kind', cooperative: 'Collaborative, workable', curious: 'Open, interested', assertive: 'Clear, confident',
  anxious: 'Worried, activated', impatient: 'Rushed, restless', sad: 'Heavy, tender', angry: 'Heated, upset', frustrated: 'Irritated, stuck', defensive: 'Guarded, protective',
  'passive-aggressive': 'Indirect, tense', sarcastic: 'Biting, indirect', dismissive: 'Rejecting, minimizing', judgmental: 'Critical, evaluative', blaming: 'Fault-focused', confrontational: 'Challenging, intense', aggressive: 'Forceful, attacking', hostile: 'Threatening, unsafe', neutral: 'Even, unclear'
};

const RED = ['blaming', 'judgmental', 'dismissive', 'sarcastic', 'passive-aggressive', 'confrontational', 'aggressive', 'hostile'];
const YELLOW = ['anxious', 'impatient', 'sad', 'angry', 'frustrated', 'defensive', 'assertive'];

export function toneZone(tone: string): ToneResult['zone'] {
  const t = tone.toLowerCase();
  if (RED.includes(t)) return 'red';
  if (YELLOW.includes(t)) return 'yellow';
  return 'green';
}

export function repairCueForTone(tone: string) {
  const t = tone.toLowerCase();
  const cues: Record<string, string> = {
    blaming: 'Try shifting from “you always/never” to “I feel… when… because… I need…”.',
    judgmental: 'Name the impact instead of evaluating the person. Try: “This affected me because…”.',
    dismissive: 'Pause and reflect back one thing you heard before responding.',
    defensive: 'Try naming what feels threatening, then ask one clarifying question.',
    frustrated: 'Slow the pace. Ask for one specific change instead of solving everything now.',
    anxious: 'Ask for reassurance or clarity directly. Try: “Can you help me understand what you mean?”',
    angry: 'Take one breath and lower the speed before continuing.',
    impatient: 'Try: “I want to resolve this, and I also want us to slow down.”',
    confrontational: 'Soften the opening. Start with what matters to you rather than what is wrong.',
    aggressive: 'Pause. Switch to one feeling and one request before continuing.',
    hostile: 'This may need a break. Consider pausing the conversation until both people feel safer.',
    curious: 'Good moment to ask one open-ended question and listen.',
    empathetic: 'Good repair tone. Stay with reflection and validation.',
    cooperative: 'Good teamwork tone. Move toward one shared next step.',
    calm: 'Steady tone. Keep using clear, specific requests.',
    assertive: 'Clear tone. Make sure the request stays specific and respectful.'
  };
  return cues[t] || 'Try naming one feeling, one impact, and one request.';
}

export function analyzeToneLocally(text: string): ToneResult {
  if (!text || text.trim().length === 0) return buildTone('neutral', 0.2);

  const lower = text.toLowerCase();
  if (/(hate|destroy|die|kill)/i.test(text)) return buildTone('hostile', 0.9);
  if (/(shut up|stupid|idiot|damn|hell)/i.test(text)) return buildTone('aggressive', 0.85);
  if (/(what's wrong with you|seriously\?|are you kidding)/i.test(text)) return buildTone('confrontational', 0.8);
  if (/(your fault|you did|you never|you always|you made me)/i.test(text)) return buildTone('blaming', 0.85);
  if (/(shouldn't|should have|ought to|you're wrong|that's stupid)/i.test(text)) return buildTone('judgmental', 0.75);
  if (/(whatever|don't care|so what|doesn't matter|fine)/i.test(text)) return buildTone('dismissive', 0.7);
  if (/(hurry|now|quickly|asap|waiting)/i.test(text)) return buildTone('impatient', 0.7);
  if (/(worried|nervous|scared|afraid|anxious|what if)/i.test(text)) return buildTone('anxious', 0.75);
  if (/(yeah right|sure|obviously|great job.*!)/i.test(text)) return buildTone('sarcastic', 0.6);
  if (/(i'm fine|no problem|if you say so|whatever you want)/i.test(text)) return buildTone('passive-aggressive', 0.65);
  if (/(angry|mad|furious|pissed)/i.test(lower)) return buildTone('angry', 0.75);
  if (/(frustrated|annoyed|irritated|stuck)/i.test(lower)) return buildTone('frustrated', 0.75);
  if (/(i need|i want|i believe|i think we should|i would like|let's)/i.test(text)) return buildTone('assertive', 0.7);
  if (/(how|why|what|when|where|tell me|curious|wonder)/i.test(text) && text.includes('?')) return buildTone('curious', 0.75);
  if (/(we can|together|let's work|team|collaborate|help)/i.test(text)) return buildTone('cooperative', 0.75);
  if (/(understand|here for you|support|care about|sorry you)/i.test(text)) return buildTone('compassionate', 0.8);
  if (/(i hear you|i understand|that must|how you feel|i see)/i.test(text)) return buildTone('empathetic', 0.8);
  if (/(it's okay|you're doing|everything will|don't worry|i'm here)/i.test(text)) return buildTone('reassuring', 0.75);
  return buildTone('calm', 0.5);
}

function buildTone(tone: string, confidence: number): ToneResult {
  return { tone, confidence, zone: toneZone(tone), color: TONE_COLORS[tone] || '#B0B0B0', description: TONE_DESCRIPTIONS[tone] || 'Tone detected', repairCue: repairCueForTone(tone) };
}
