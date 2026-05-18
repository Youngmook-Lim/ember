const { embedBatch } = require('../../lib/openrouter');

const BATCH_SIZE = 100;

// Embeds every text in `texts` and returns an aligned array of vectors (number[][]).
// Logs progress every batch.
async function embedAll(texts) {
  const all = new Array(texts.length);
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const vectors = await embedBatch(slice);
    if (vectors.length !== slice.length) {
      throw new Error(`Embedding count mismatch: expected ${slice.length}, got ${vectors.length}`);
    }
    for (let j = 0; j < vectors.length; j++) all[i + j] = vectors[j];
    console.log(`[embed] ${Math.min(i + BATCH_SIZE, texts.length)} / ${texts.length}`);
  }
  return all;
}

module.exports = { embedAll };
