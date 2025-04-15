document
  .querySelector('#reset-password-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.querySelector('#new-password').value.trim();
    const token = window.location.pathname.split('/').pop(); // Extract token from URL

    const response = await fetch(`/api/reset/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const feedback = document.querySelector('#reset-feedback');
    if (response.ok) {
      feedback.textContent = '✅ Password updated! Redirecting...';
      setTimeout(() => window.location.href = '/', 2000);
    } else {
      const data = await response.json();
      feedback.textContent = `❌ ${data.message || 'Failed to update password'}`;
    }
  });
