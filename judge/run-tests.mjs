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
let modelArg = process.argv[2] || 'claude-haiku-4-5';
let runsArg = 1;

// Check for --runs option
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--runs' && i + 1 < process.argv.length) {
    runsArg = parseInt(process.argv[i + 1], 10);
    if (isNaN(runsArg) || runsArg < 1) {
      console.error('Error: --runs must be a positive integer');
      process.exit(1);
    }
    // Remove --runs option from args and keep modelArg
    if (process.argv[2] === '--runs') {
      modelArg = process.argv[4] || 'claude-haiku-4-5';
    }
  }
}

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

  async function post(includeTemperature) {
    const body = {
      model: modelArg,
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    };
    if (includeTemperature) body.temperature = 0;

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(body)
    });
  }

  const startTime = Date.now();
  let response = await post(true);

  if (!response.ok && response.status === 400) {
    const errorText = await response.text();
    if (errorText.includes('temperature') && errorText.includes('deprecated')) {
      // Some newer models reject the temperature param entirely; retry without it.
      response = await post(false);
    } else {
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
  }

  const latency = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  // Some models (e.g. extended-thinking models) prepend a "thinking" block
  // before the "text" block, so find the text block by type rather than
  // assuming index 0.
  const textBlock = data.content.find(block => block.type === 'text');
  const content = textBlock ? textBlock.text : null;

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

// Run all tests (returns raw results without printing)
async function runTestsRaw() {
  const results = [];
  let passes = 0;
  let failures = 0;
  let warnings = 0;
  const latencies = [];
  let slowest = { latency: 0, test: null };

  for (const test of testSet.tests) {
    try {
      const term = findTerm(test.term);
      if (!term) throw new Error(`Term not found: ${test.term}`);

      const { content, latency } = await callJudge(term, test.transcript);
      const parsed = content ? parseResponse(content) : null;

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
        testResult.failure = content === null ? 'no verdict returned' : 'Invalid JSON response';
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

    } catch (error) {
      failures++;
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

  return {
    results,
    stats: {
      passes,
      failures,
      warnings,
      latencies,
      slowest
    }
  };
}

// Print test results table
function printTestTable(results, showRun = null) {
  console.log(`Running tests with model: ${modelArg}${showRun !== null ? ` (run ${showRun})` : ''}\n`);
  console.log('Test ID       | Term         | Case                      | Expected  | Actual    | Status   | Latency');
  console.log('-'.repeat(100));

  for (const result of results) {
    const parsed = result.actual;
    const test = testSet.tests.find(t => t.id === result.id);
    let status = 'PASS';
    if (result.failure) {
      status = 'FAIL';
    } else if (result.warning) {
      status = 'WARN';
    }

    const expectedStr = `${test.expected.verdict}`;
    const actualStr = parsed ? parsed.verdict : (result.failure ? 'INVALID' : 'ERROR');
    const testIdPad = result.id.padEnd(13);
    const termPad = result.term.padEnd(12);
    const casePad = result.case.substring(0, 25).padEnd(25);
    const expectedPad = expectedStr.padEnd(9);
    const actualPad = actualStr.padEnd(9);
    const statusPad = status.padEnd(8);

    console.log(`${testIdPad}| ${termPad}| ${casePad}| ${expectedPad}| ${actualPad}| ${statusPad}| ${result.latency}ms`);
  }
}

// Print summary
function printSummary(stats) {
  console.log('\n' + '='.repeat(100));
  console.log(`Summary:`);
  console.log(`  Passes:           ${stats.passes}`);
  console.log(`  Failures:         ${stats.failures}`);
  console.log(`  Warnings:         ${stats.warnings}`);
  const avgLatency = stats.latencies.length > 0 ? (stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length).toFixed(0) : 'N/A';
  console.log(`  Average latency:  ${avgLatency}ms`);
  console.log(`  Slowest call:     ${stats.slowest.test} (${stats.slowest.latency}ms)`);
}

// Save results to file
function saveResults(allRuns) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const resultsFile = path.join(resultsDir, `${modelArg}-${timestamp}.json`);

  if (runsArg === 1) {
    // Single run - save as before
    const run = allRuns[0];
    fs.writeFileSync(resultsFile, JSON.stringify({
      model: modelArg,
      timestamp: new Date().toISOString(),
      summary: {
        passes: run.stats.passes,
        failures: run.stats.failures,
        warnings: run.stats.warnings,
        totalTests: testSet.tests.length,
        avgLatency: run.stats.latencies.length > 0 ? run.stats.latencies.reduce((a, b) => a + b, 0) / run.stats.latencies.length : 0,
        slowest: run.stats.slowest
      },
      tests: run.results
    }, null, 2));
  } else {
    // Multiple runs - save with diff info
    const diffInfo = {};
    for (const test of testSet.tests) {
      const verdicts = allRuns.map(run => {
        const result = run.results.find(r => r.id === test.id);
        return result.actual?.verdict || 'error';
      });
      if (new Set(verdicts).size > 1) {
        diffInfo[test.id] = verdicts;
      }
    }

    fs.writeFileSync(resultsFile, JSON.stringify({
      model: modelArg,
      timestamp: new Date().toISOString(),
      runs: runsArg,
      testsWithDifferences: diffInfo,
      allRuns: allRuns.map((run, idx) => ({
        runNumber: idx + 1,
        summary: {
          passes: run.stats.passes,
          failures: run.stats.failures,
          warnings: run.stats.warnings,
          avgLatency: run.stats.latencies.length > 0 ? run.stats.latencies.reduce((a, b) => a + b, 0) / run.stats.latencies.length : 0
        },
        tests: run.results
      }))
    }, null, 2));
  }

  console.log(`\nResults saved to: ${resultsFile}`);
  return resultsFile;
}

// Main execution
async function main() {
  console.log(`Running tests with model: ${modelArg} (${runsArg} run${runsArg > 1 ? 's' : ''})\n`);

  const allRuns = [];
  for (let runNum = 1; runNum <= runsArg; runNum++) {
    const run = await runTestsRaw();
    allRuns.push(run);
    printTestTable(run.results, runsArg > 1 ? runNum : null);
    printSummary(run.stats);
  }

  // Show differences if multiple runs
  if (runsArg > 1) {
    console.log('\n' + '='.repeat(100));
    console.log('Tests with different results between runs:');
    let hasDiffs = false;
    for (const test of testSet.tests) {
      const verdicts = allRuns.map(run => {
        const result = run.results.find(r => r.id === test.id);
        return result.actual?.verdict || (result.failure ? 'error' : 'invalid');
      });
      if (new Set(verdicts).size > 1) {
        hasDiffs = true;
        console.log(`  ${test.id}: ${verdicts.join(' → ')}`);
      }
    }
    if (!hasDiffs) {
      console.log('  (no differences found)');
    }
  }

  saveResults(allRuns);

  const hasFailures = allRuns.some(run => run.stats.failures > 0);
  return hasFailures ? 1 : 0;
}

// Run
const exitCode = await main();
process.exit(exitCode);
