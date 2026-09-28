import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

/**
 * Server-side session for the voice passcode.
 *
 * `/voice-test`'s own passcode check used to be client-side only: the verify
 * route compared the passcode and returned `{ok:true}`, but nothing it did
 * carried that fact anywhere the server could later check. `/api/voice-test/
 * transcribe` and `/api/judge` trusted every request — anyone who found those
 * URLs could call them with no passcode at all. This closes that: verifying
 * the passcode now mints a signed, httpOnly session cookie, and every route
 * that spends real API budget (transcription, judging) requires it.
 *
 * The cookie carries no `maxAge`/`expires`, so it is a true session cookie —
 * gone when the browser session ends, which is what "entered once per
 * session" means here. It is signed with an HMAC over the passcode itself:
 * only the server that knows `VOICE_TEST_PASSCODE` can mint a value that
 * verifies, so there is no separate secret to configure or leak.
 */

const COOKIE_NAME = 'voice_session';
const TOKEN_VALUE = 'ok';

function secret(): string {
  const passcode = process.env.VOICE_TEST_PASSCODE;
  if (!passcode) throw new Error('VOICE_TEST_PASSCODE not configured');
  return passcode;
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

/** Called once, right after the passcode itself has been checked. */
export async function grantVoiceSession(): Promise<void> {
  const token = `${TOKEN_VALUE}.${sign(TOKEN_VALUE)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

/** Whether the current request carries a valid, unforged session cookie. */
export async function hasVoiceSession(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const separator = raw.indexOf('.');
  if (separator < 0) return false;

  const value = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (value !== TOKEN_VALUE) return false;

  const expected = sign(value);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
