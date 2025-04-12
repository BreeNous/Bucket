console.log("🌐 Current page:", window.location.href);

const loginFormHandler = async (event) => {
  event.preventDefault();

  // Collect values from the login form
  const email = document.querySelector('#email-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();

  if (email && password) {
    // Send a POST request to the API endpoint

    const response = await fetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      window.location.href = '/myList';
    } else {
      const errorData = await response.json();
      const errorEl = document.querySelector('#login-error');
      const resetLink = document.querySelector('#reset-link');
    
      if (errorEl) {
        errorEl.textContent = errorData.message || 'Login failed. Try again.';
      }
      if (resetLink) {
        resetLink.style.display = 'inline-block';
        resetLink.onclick = () => {
          const email = document.querySelector('#email-login').value.trim();
          if (email) {
            window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
          } else {
            alert("Please enter your email before resetting.");
          }
        };
      }
    }
    
  }
};

document
  .querySelector('.login-form')
  .addEventListener('submit', loginFormHandler);

