#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`.env file not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    env[key] = valueParts.join('=');
  }
  return env;
}

const envPath = path.join(process.cwd(), '.env');
const envVars = loadEnv(envPath);
const apiKey = envVars.ANTHROPIC_API_KEY;

// Parse command-line arguments
const modelArg = process.argv[2] || 'claude-haiku-4-5';

if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY not found in .env');
  process.exit(1);
}

// Load files
const rubric = JSON.parse(fs.readFileSync(path.join(__dirname, 'judging-rubric.json'), 'utf8'));
const testSet = JSON.parse(fs.readFileSync(path.join(__dirname, 'judge-test-set.json'), 'utf8'));
const promptFile = fs.readFileSync(path.join(__dirname, 'judge-prompt.md'), 'utf8');

// Extract system prompt and user template from markdown
function extractPrompts(markdown) {
  const systemMatch = markdown.match(/## System prompt\s*\n\s*```\s*\n([\s\S]*?)\n```/);
  const userMatch = markdown.match(/## User message template\s*\n[\s\S]*?```\s*\n([\s\S]*?)\n```/);

  if (!systemMatch) throw new Error('Could not find system prompt in judge-prompt.md');
  if (!userMatch) throw new Error('Could not find user message template in judge-prompt.md');

  const systemPrompt = systemMatch[1].trim();
  const userTemplate = userMatch[1].trim();

  return { systemPrompt, userTemplate };
}

const { systemPrompt, userTemplate } = extractPrompts(promptFile);

// Create results directory
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Find term by id
function findTerm(termId) {
  return rubric.terms.find(t => t.id === termId);
}

// Build user message by filling the template
function buildUserMessage(template, term, transcript) {
  // Fill template with placeholders:
  // {{term_rubric_json}} -> the term object as JSON
  // {{voice_or_typed}} -> "voice"
  // {{transcript}} -> the transcript text
  let message = template;
  message = message.replace(/{{term_rubric_json}}/g, JSON.stringify(term, null, 2));
  message = message.replace(/{{voice_or_typed}}/g, 'voice');
  message = message.replace(/{{transcript}}/g, transcript);

  return message;
}

// Call Anthropic API
async function callJudge(term, transcript) {
  const userMessage = buildUserMessage(userTemplate, term, transcript);

  const startTime = Date.now();
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model: modelArg,
      max_tokens: 400,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    })
  });

  const latency = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  return { content, latency };
}

// Parse and validate response
function parseResponse(content) {
  try {
    // Strip markdown code fences if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7); // Remove ```json
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3); // Remove ```
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3); // Remove trailing ```
    }
    return JSON.parse(jsonStr.trim());
  } catch {
    return null; // Will be marked as failure
  }
}

// Run all tests
async function runTests() {
  const results = [];
  let passes = 0;
  let failures = 0;
  let warnings = 0;
  const latencies = [];
  let slowest = { latency: 0, test: null };

  console.log(`Running tests with model: ${modelArg}\n`);
  console.log('Test ID       | Term         | Case                      | Expected  | Actual    | Status   | Latency');
  console.log('-'.repeat(100));

  for (const test of testSet.tests) {
    try {
      const term = findTerm(test.term);
      if (!term) throw new Error(`Term not found: ${test.term}`);

      const { content, latency } = await callJudge(term, test.transcript);
      const parsed = parseResponse(content);

      let status = 'PASS';
      const testResult = {
        id: test.id,
        term: test.term,
        case: test.case,
        expected: test.expected,
        actual: parsed,
        response: content,
        latency
      };

      if (!parsed) {
        status = 'FAIL';
        failures++;
        testResult.failure = 'Invalid JSON response';
      } else {
        const verdictMatch = parsed.verdict === test.expected.verdict;
        const hintTargetMatch = parsed.hint_target === test.expected.hint_target;
        const ideasMatch = JSON.stringify(parsed.ideas_hit?.sort()) ===
                          JSON.stringify(test.expected.ideas_hit?.sort());

        if (!verdictMatch || !hintTargetMatch) {
          status = 'FAIL';
          failures++;
          testResult.failure = [];
          if (!verdictMatch) testResult.failure.push(`verdict: ${parsed.verdict} vs ${test.expected.verdict}`);
          if (!hintTargetMatch) testResult.failure.push(`hint_target: ${parsed.hint_target} vs ${test.expected.hint_target}`);
        } else {
          passes++;
          if (!ideasMatch) {
            status = 'WARN';
            warnings++;
            testResult.warning = `ideas_hit mismatch`;
          }
        }
      }

      results.push(testResult);
      latencies.push(latency);

      if (latency > slowest.latency) {
        slowest.latency = latency;
        slowest.test = test.id;
      }

      const expectedStr = `${test.expected.verdict}`;
      const actualStr = parsed ? parsed.verdict : 'INVALID';
      const testIdPad = test.id.padEnd(13);
      const termPad = test.term.padEnd(12);
      const casePad = test.case.substring(0, 25).padEnd(25);
      const expectedPad = expectedStr.padEnd(9);
      const actualPad = actualStr.padEnd(9);
      const statusPad = status.padEnd(8);

      console.log(`${testIdPad}| ${termPad}| ${casePad}| ${expectedPad}| ${actualPad}| ${statusPad}| ${latency}ms`);

    } catch (error) {
      failures++;
      console.log(`${test.id.padEnd(13)}| ERROR: ${error.message}`);
      results.push({
        id: test.id,
        term: test.term,
        expected: test.expected,
        actual: null,
        failure: error.message,
        latency: 0
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(100));
  console.log(`Summary:`);
  console.log(`  Passes:           ${passes}`);
  console.log(`  Failures:         ${failures}`);
  console.log(`  Warnings:         ${warnings}`);
  console.log(`  Average latency:  ${(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0)}ms`);
  console.log(`  Slowest call:     ${slowest.test} (${slowest.latency}ms)`);

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const resultsFile = path.join(resultsDir, `${modelArg}-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({
    model: modelArg,
    timestamp: new Date().toISOString(),
    summary: {
      passes,
      failures,
      warnings,
      totalTests: testSet.tests.length,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      slowest: slowest
    },
    tests: results
  }, null, 2));

  console.log(`\nResults saved to: ${resultsFile}`);

  return failures === 0 ? 0 : 1;
}

// Run
const exitCode = await runTests();
process.exit(exitCode);
