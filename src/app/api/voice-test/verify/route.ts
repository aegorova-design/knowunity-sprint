import { NextRequest, NextResponse } from 'next/server';

import { grantVoiceSession, hasVoiceSession } from '@/lib/voicePasscode';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json();

  const correctPasscode = process.env.VOICE_TEST_PASSCODE;

  if (!correctPasscode) {
    return NextResponse.json(
      { error: 'Passcode not configured' },
      { status: 500 }
    );
  }

  if (passcode === correctPasscode) {
    // The pass itself — every transcribe and judge call checks for this,
    // not for the passcode again.
    await grantVoiceSession();
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json(
      { error: 'Invalid passcode' },
      { status: 401 }
    );
  }
}

/**
 * Whether this browser session already has a valid session cookie —
 * "entered once per session" needs somewhere to ask that survives a reload,
 * since the passcode form used to hold the answer in React state alone.
 */
export async function GET() {
  return NextResponse.json({ authenticated: await hasVoiceSession() });
}
