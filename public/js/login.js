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
      // If successful, redirect the browser to the myList page
      window.location.href = '/myList';
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Invalid login.");


    }
  }
};

document
  .querySelector('.login-form')
  .addEventListener('submit', loginFormHandler);

