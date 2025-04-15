const signupFormHandler = async (event) => {
  event.preventDefault();

  const name = document.querySelector('#name-signup').value.trim();
  const email = document.querySelector('#email-signup').value.trim();
  const password = document.querySelector('#password-signup').value.trim();
  const feedbackEl = document.querySelector('#signup-feedback');

  feedbackEl.textContent = ''; // Clear previous errors

  if (!name || !email || !password) {
    feedbackEl.textContent = 'All fields are required.';
    return;
  }

  if (password.length < 8) {
    feedbackEl.textContent = 'Your password must be at least 8 characters long.';
    return;
  }

  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    feedbackEl.textContent = '';
    window.location.href = '/myList';
  } else if (response.status === 409) {
    feedbackEl.textContent = 'An account with that email already exists. Please log in instead.';
  } else {
    const errorData = await response.json();
    feedbackEl.textContent = errorData.message || 'Signup failed. Please try again.';
  }
};

document.querySelectorAll('.toggle-password')?.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const targetId = toggle.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      input.type = toggle.checked ? 'text' : 'password';
    }
  });
});

document.querySelector('.signup-form')?.addEventListener('submit', signupFormHandler);
