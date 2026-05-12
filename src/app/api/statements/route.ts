import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await sql`select * from statements where clerk_user_id = ${userId} order by created_at desc limit 100`;
  return NextResponse.json({ statements: rows });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.refined_text) return NextResponse.json({ error: 'refined_text is required' }, { status: 400 });
  const rows = await sql`
    insert into statements (clerk_user_id, raw_text, refined_text, scenario, tone)
    values (${userId}, ${body.raw_text || null}, ${body.refined_text}, ${body.scenario || 'relationship'}, ${body.tone || 'empathetic'})
    returning *
  `;
  return NextResponse.json({ statement: rows[0] });
}
