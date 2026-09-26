import { NextRequest, NextResponse } from 'next/server';
import { JUDGE_SYSTEM_PROMPT, JUDGE_USER_TEMPLATE, rubric } from '@/lib/judge-config';

export async function POST(request: NextRequest) {
  try {
    const { term, transcript } = await request.json();

    if (!term || !transcript) {
      return NextResponse.json(
        { error: 'Missing term or transcript' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const systemPrompt = JUDGE_SYSTEM_PROMPT;
    const userTemplate = JUDGE_USER_TEMPLATE;

    // Find term in rubric
    const termData = (rubric as any).terms.find((t: any) => t.id === term);
    if (!termData) {
      return NextResponse.json(
        { error: `Term not found: ${term}` },
        { status: 400 }
      );
    }

    // Build user message
    let userMessage = userTemplate;
    userMessage = userMessage.replace(/{{term_rubric_json}}/g, JSON.stringify(termData, null, 2));
    userMessage = userMessage.replace(/{{voice_or_typed}}/g, 'voice');
    userMessage = userMessage.replace(/{{transcript}}/g, transcript);

    // Call Claude with retry
    let response = null;
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 400,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage
              }
            ]
          })
        });

        if (response.ok) {
          break;
        } else {
          lastError = `API error: ${response.status}`;
          if (attempt === 0) continue;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt === 0) continue;
      }
    }

    if (!response || !response.ok) {
      console.error('Judge API failed:', lastError);
      return NextResponse.json(
        { error: 'Judge API failed', details: lastError },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textBlock = data.content.find((block: any) => block.type === 'text');
    if (!textBlock) {
      console.error('No text block in response');
      return NextResponse.json(
        { error: 'No text in response' },
        { status: 502 }
      );
    }

    const content = textBlock.text;

    // Parse JSON, strip code fences
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    let verdict: any;
    try {
      verdict = JSON.parse(jsonStr.trim());
    } catch (err) {
      console.error('Failed to parse verdict JSON:', err);
      return NextResponse.json(
        { error: 'Invalid JSON response' },
        { status: 502 }
      );
    }

    if (!verdict.verdict) {
      console.error('No verdict in parsed response');
      return NextResponse.json(
        { error: 'No verdict in response' },
        { status: 502 }
      );
    }

    return NextResponse.json(verdict);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Judge error:', errorMsg);
    return NextResponse.json(
      { error: 'Judge error', details: errorMsg },
      { status: 500 }
    );
  }
}
