import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'empty_recording', message: 'No audio data received' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'api_error', message: 'Server configuration error' },
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

    // Call OpenAI Transcription API
    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: openaiFormData
      });
    } catch (fetchError) {
      console.error('Network error calling OpenAI:', fetchError instanceof Error ? fetchError.message : String(fetchError));
      return NextResponse.json(
        { error: 'api_error', message: 'Failed to reach OpenAI API' },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      const errorMessage = errorData.error?.message || response.statusText || 'Unknown error';
      return NextResponse.json(
        { error: 'api_error', message: `OpenAI error (${response.status}): ${errorMessage}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    if (!data.text) {
      console.error('No transcript in response:', data);
      return NextResponse.json(
        { error: 'api_error', message: 'No transcript returned from OpenAI' },
        { status: 502 }
      );
    }

    return NextResponse.json({ transcript: data.text });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Transcription error:', errorMsg);
    return NextResponse.json(
      { error: 'api_error', message: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
