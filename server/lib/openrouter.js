const { OpenAI } = require('openai');

let _client = null;
function getClient() {
  if (_client) return _client;
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }
  _client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
  return _client;
}

async function embed(text) {
  const client = getClient();
  const res = await client.embeddings.create({
    model: process.env.OPENROUTER_EMBED_MODEL,
    input: text,
  });
  return res.data[0].embedding; // number[] of length 1536
}

async function embedBatch(texts) {
  const client = getClient();
  const res = await client.embeddings.create({
    model: process.env.OPENROUTER_EMBED_MODEL,
    input: texts,
  });
  return res.data.map(d => d.embedding);
}

// chat({ system, user, jsonMode }) -> string (text) or object (jsonMode)
async function chat({ system, user, jsonMode = false, temperature = 0.4 }) {
  const client = getClient();
  const res = await client.chat.completions.create({
    model: process.env.OPENROUTER_CHAT_MODEL,
    temperature,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: user },
    ],
  });
  const content = res.choices[0].message.content ?? '';
  if (!jsonMode) return content;
  // Some models wrap JSON in markdown code fences despite jsonMode — strip them.
  const stripped = content.replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/, '$1').trim();
  try {
    return JSON.parse(stripped);
  } catch (err) {
    const e = new Error('OpenRouter returned non-JSON content despite jsonMode');
    e.cause = err;
    e.content = content;
    throw e;
  }
}

module.exports = { embed, embedBatch, chat };
