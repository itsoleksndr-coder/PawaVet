import { test } from 'node:test';
import assert from 'node:assert/strict';
test('packaged Vercel entry resolves internal modules and handles API requests', async () => {
  const { default: api } = await import('../api/index.js');
  const server = api.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const response = await fetch('http://127.0.0.1:' + address.port + '/api/not-a-route');
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-type').includes('application/json'), true);
    assert.equal((await response.json()).error, 'API endpoint not found.');
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
