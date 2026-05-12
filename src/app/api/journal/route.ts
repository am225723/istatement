import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await sql`select * from journal_entries where clerk_user_id = ${userId} order by created_at desc limit 100`;
  return NextResponse.json({ entries: rows });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body.body) return NextResponse.json({ error: 'body is required' }, { status: 400 });
  const rows = await sql`
    insert into journal_entries (clerk_user_id, title, body)
    values (${userId}, ${body.title || null}, ${body.body})
    returning *
  `;
  return NextResponse.json({ entry: rows[0] });
}
