import { NextRequest, NextResponse } from 'next/server';

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
    return NextResponse.json({ ok: true });
  } else {
    return NextResponse.json(
      { error: 'Invalid passcode' },
      { status: 401 }
    );
  }
}
