import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeToneLocally } from '@/lib/tone';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'DEEPGRAM_API_KEY is missing. Add it in Vercel Environment Variables.' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get('audio');

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 });
    }

    const audioBuffer = await audio.arrayBuffer();

    const deepgramUrl = new URL('https://api.deepgram.com/v1/listen');
    deepgramUrl.searchParams.set('model', 'nova-2');
    deepgramUrl.searchParams.set('smart_format', 'true');
    deepgramUrl.searchParams.set('punctuate', 'true');
    deepgramUrl.searchParams.set('language', 'en-US');

    const dgRes = await fetch(deepgramUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': audio.type || 'audio/webm'
      },
      body: audioBuffer
    });

    const dgData = await dgRes.json().catch(() => ({}));

    if (!dgRes.ok) {
      return NextResponse.json({ error: dgData?.err_msg || dgData?.error || 'Deepgram transcription failed.' }, { status: dgRes.status });
    }

    const transcript = dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = dgData?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
    const tone = analyzeToneLocally(transcript);

    return NextResponse.json({ transcript, confidence, tone });
  } catch (error: any) {
    console.error('Deepgram transcription error:', error);
    return NextResponse.json({ error: error.message || 'Transcription failed.' }, { status: 500 });
  }
}
