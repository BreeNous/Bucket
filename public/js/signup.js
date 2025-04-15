
const signupFormHandler = async (event) => {
    event.preventDefault();
  
    const name = document.querySelector('#name-signup').value.trim();
    const email = document.querySelector('#email-signup').value.trim();
    const password = document.querySelector('#password-signup').value.trim();
    const feedbackEl = document.querySelector('#signup-feedback');
  
    if (name && email && password) {
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
        feedbackEl.textContent = 'Signup failed. Please try again.';
      }
    }
  };
  
  document.querySelector('.signup-form')?.addEventListener('submit', signupFormHandler);
