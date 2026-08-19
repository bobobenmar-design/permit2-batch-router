const BACKEND_URL = 'http://localhost:3003';

function setStatus(message: string) {
  const element = document.getElementById('status-message');
  if (element) {
    element.textContent = message;
  }
}

async function checkBackendHealth() {
  const healthEl = document.getElementById('health-status');
  const txEl = document.getElementById('tx-status');

  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Backend check failed');
    }

    setStatus('Backend automation is active. The relayer is monitoring and dispatching signed batch flows.');
    if (healthEl) {
      healthEl.textContent = `Backend healthy: ${data.status} (${data.ok ? 'online' : 'offline'})`;
    }
    if (txEl) {
      txEl.textContent = 'No manual wallet submission is required in this mode.';
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown backend error';
    setStatus('Backend automation is unavailable. Manual relayer execution is disabled.');
    if (healthEl) {
      healthEl.textContent = `Backend error: ${message}`;
    }
  }
}

const walletParam = new URLSearchParams(window.location.search).get('wallet');
if (walletParam) {
  fetch(`${BACKEND_URL}/api/register-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress: walletParam }),
  }).catch(() => undefined);
}

checkBackendHealth();

