import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await sql`select * from uploaded_files where clerk_user_id = ${userId} order by created_at desc limit 100`;
  return NextResponse.json({ files: rows });
}
