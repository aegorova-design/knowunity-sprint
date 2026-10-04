import { cookies } from 'next/headers';

import { INPUT_MODE_COOKIE, parseInputMode, type InputModeState } from './inputMode';

export async function readInputMode(): Promise<InputModeState> {
  const store = await cookies();
  return parseInputMode(store.get(INPUT_MODE_COOKIE)?.value);
}
