const app = require('./index');
const http = require('http');

let server;

beforeAll(() => {
  server = http.createServer(app).listen(0);
});

afterAll(() => {
  server.close();
});

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      { hostname: 'localhost', port, path, method,
        headers: { 'Content-Type': 'application/json' } },
      res => {
        let raw = '';
        res.on('data', chunk => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

test('GET /tasks returns empty array initially', async () => {
  const res = await request('GET', '/tasks');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('POST /tasks creates a task', async () => {
  const res = await request('POST', '/tasks', { title: 'Test task' });
  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Test task');
  expect(res.body.done).toBe(false);
});

test('GET /tasks returns created tasks', async () => {
  const res = await request('GET', '/tasks');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});
