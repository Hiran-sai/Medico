import test from 'node:test';
import assert from 'node:assert/strict';
import { extractScheduleWithGemini } from '../utils/gemini.js';

const originalFetch = global.fetch;
const originalApiKey = process.env.GEMINI_API_KEY;

process.env.GEMINI_API_KEY = 'test-key';

test('retries once and then parses a successful Gemini response', async () => {
  let attempts = 0;
  global.fetch = async () => {
    attempts += 1;
    if (attempts === 1) {
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({ error: { message: 'Quota exceeded' } })
      };
    }

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: '[{"name":"Paracetamol","dosage":"500mg","frequency":"twice daily","timings":[],"duration":"5 days","instructions":""}]' }]
          }
        }]
      })
    };
  };

  try {
    const medicines = await extractScheduleWithGemini('Paracetamol 500mg twice daily for 5 days.', 2, 0);
    assert.equal(attempts, 2);
    assert.ok(Array.isArray(medicines));
    assert.equal(medicines.length, 1);
    assert.equal(medicines[0].name, 'Paracetamol');
    assert.equal(medicines[0].dosage, '500mg');
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  }
});
