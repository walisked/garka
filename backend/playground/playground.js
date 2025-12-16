// Simple playground script to exercise key backend endpoints.
// Usage: 1) Start server: npm run dev
//        2) Run: node playground/playground.js

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const API = process.env.PLAYGROUND_API_URL || 'http://localhost:5000/api';

async function run() {
  console.log('Playground started against', API);

  // 1. Health
  const health = await fetch(`${API}/health`);
  console.log('Health:', await health.json());

  // 2. Register a test user
  const email = `playground+${Date.now()}@example.com`;
  const regRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      fullName: 'Playground User',
      email,
      phone: '08000000000',
      password: 'pgpass123'
    })
  });
  const reg = await regRes.json();
  console.log('Register:', regRes.status, reg.message || reg);

  // 3. Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password: 'pgpass123' })
  });
  const login = await loginRes.json();
  console.log('Login:', loginRes.status, login.message || login);

  const token = login.data?.token;
  if (!token) return console.log('No token, cannot continue');

  // 4. Get profile
  const profileRes = await fetch(`${API}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Profile:', profileRes.status, await profileRes.json());

  console.log('\nPlayground finished.');
}

run().catch(err => {
  console.error('Playground error:', err.message);
  process.exit(1);
});
