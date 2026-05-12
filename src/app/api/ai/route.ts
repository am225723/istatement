import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { askAI } from '@/lib/ai';
import { buildIStatementPrompt } from '@/lib/prompts';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const prompt = body.mode === 'statement'
      ? buildIStatementPrompt(body)
      : String(body.message || '');

    if (!prompt.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const reply = await askAI(prompt, body.systemPrompt || undefined);

    if (body.mode === 'statement' && reply.trim()) {
      await sql`
        insert into statements (clerk_user_id, raw_text, refined_text, scenario, tone)
        values (${userId}, ${body.raw || null}, ${reply}, ${body.scenario || 'relationship'}, ${body.tone || 'empathetic'})
      `;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
  }
}
