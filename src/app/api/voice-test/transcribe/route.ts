import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'empty_recording' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'api_error' },
        { status: 500 }
      );
    }

    // Prepare form data for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'gpt-transcribe');
    openaiFormData.append('language', 'en');
    // Pass keyword hints using gpt-transcribe's keyword hints feature
    openaiFormData.append('keywords', 'camouflage, mammal, hibernation');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: openaiFormData
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'api_error' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const transcript = data.text || '';

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'api_error' },
      { status: 500 }
    );
  }
}
