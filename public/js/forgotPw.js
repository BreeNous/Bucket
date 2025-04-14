document.querySelector('#forgot-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#reset-email').value.trim();
    const feedback = document.querySelector('#reset-feedback');
  
    const res = await fetch('/api/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  
    const result = await res.json();
    feedback.textContent = result.message || 'Something went wrong.';
  });
  