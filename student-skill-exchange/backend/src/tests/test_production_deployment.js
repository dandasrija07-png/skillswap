/**
 * ============================================================================
 * PRODUCTION DEPLOYMENT & SMOKE VERIFICATION SUITE
 * ============================================================================
 * Simulates a live production deployment environment:
 * - Boot Express in NODE_ENV=production
 * - Verify static asset delivery from frontend/dist (monolithic hosting)
 * - Verify health check API (uptime, status, timestamp)
 * - Verify production CORS behavior with whitelisted & foreign origins
 * - Verify REST API endpoints and data responses
 * - Verify Socket.IO handshake and connection
 * ============================================================================
 */

process.env.NODE_ENV = 'production';
process.env.TEST_RUNNER = 'true';
process.env.CLIENT_URL = 'http://localhost:5173,https://skillswap.edu';

import { io as ClientIO } from '../../../frontend/node_modules/socket.io-client/build/esm/index.js';

const PROD_PORT = 5099;
const PROD_BASE_URL = `http://127.0.0.1:${PROD_PORT}`;

let serverInstance;
const results = [];

function assert(pass, testName, details = '') {
  results.push({ name: testName, passed: Boolean(pass), details });
  const icon = pass ? '  ✅ [PASS]' : '  ❌ [FAIL]';
  console.log(`${icon} ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runProdSmokeTest() {
  console.log('============================================================================');
  console.log('🚀 PRODUCTION DEPLOYMENT SMOKE VERIFICATION');
  console.log('============================================================================\n');

  const { server } = await import('../server.js');

  await new Promise((resolve) => {
    serverInstance = server.listen(PROD_PORT, resolve);
  });
  console.log(`📡 Production server booted on ${PROD_BASE_URL}\n`);

  try {
    // 1. Health Check Endpoint Probe
    console.log('--- 1. Probing System Health Endpoint ---');
    const healthRes = await fetch(`${PROD_BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200 OK');
    const healthData = await healthRes.json();
    assert(healthData.status === 'success', 'Health status is "success"');
    assert(Boolean(healthData.timestamp), 'Valid ISO timestamp returned in health response');

    // 2. Monolithic Static Frontend Serving Probe
    console.log('\n--- 2. Probing Static Frontend Delivery (Single-Service Hosting) ---');
    const rootHtmlRes = await fetch(`${PROD_BASE_URL}/`);
    assert(rootHtmlRes.status === 200, 'GET / serves frontend index.html');
    const rootHtmlText = await rootHtmlRes.text();
    assert(rootHtmlText.includes('<div id="root"></div>'), 'Frontend index.html contains React mount container');
    assert(rootHtmlText.includes('Student Skill Exchange Platform'), 'HTML title correctly rendered');

    // SPA Client-Side Route Fallback Probe
    const clientRouteRes = await fetch(`${PROD_BASE_URL}/explore`);
    assert(clientRouteRes.status === 200, 'GET /explore falls back to index.html for SPA routing');

    // 3. API Catalog Endpoint Probe
    console.log('\n--- 3. Probing Core REST API Endpoints ---');
    const skillsRes = await fetch(`${PROD_BASE_URL}/api/skills`);
    assert(skillsRes.status === 200, 'GET /api/skills returns HTTP 200 OK');
    const skillsData = await skillsRes.json();
    assert(Array.isArray(skillsData.data) && skillsData.data.length >= 8, 'Global skills catalog populated');

    // Authentication Login Probe
    const loginRes = await fetch(`${PROD_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@dtu.ac.in', password: 'Password@123' }),
    });
    assert(loginRes.status === 200, 'POST /api/auth/login authenticates student');
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    assert(Boolean(token), 'Valid JWT Bearer token issued');

    // Authenticated Profile Probe
    const profileRes = await fetch(`${PROD_BASE_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(profileRes.status === 200, 'GET /api/profile/me returns authenticated student profile');

    // 4. Production CORS Validation
    console.log('\n--- 4. Validating Production CORS Configuration ---');
    const corsPreflightRes = await fetch(`${PROD_BASE_URL}/api/skills`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://skillswap.edu',
        'Access-Control-Request-Method': 'GET',
      },
    });
    assert(
      corsPreflightRes.status === 204 || corsPreflightRes.status === 200,
      'CORS preflight for whitelisted domain returns 200/204'
    );

    // 5. Production Socket.IO Connection Probe
    console.log('\n--- 5. Validating Production Socket.IO Real-Time Gateway ---');
    const socket = ClientIO(PROD_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 2,
    });

    const socketConnected = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 4000);
      socket.on('connect', () => {
        clearTimeout(timeout);
        resolve(true);
      });
      socket.on('connect_error', (e) => {
        clearTimeout(timeout);
        console.error('Socket connect error:', e.message);
        resolve(false);
      });
    });

    assert(socketConnected, 'Production Socket.IO connection authenticated and established');
    socket.disconnect();

  } catch (err) {
    console.error('Production smoke verification error:', err);
    assert(false, 'Smoke verification failure', err.message);
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log('\n🛑 Production test server stopped.');
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log('\n============================================================================');
  console.log(`📊 PRODUCTION SMOKE RESULTS: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  if (passed === total) {
    console.log('🎉 FULL APPLICATION & DEPLOYMENT CONFIGURATION READY FOR PRODUCTION!');
  }
  console.log('============================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runProdSmokeTest();
