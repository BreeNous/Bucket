// logout 
const logout = async () => {
  const response = await fetch('/api/users/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  if (response.ok) {
    document.location.replace('/');
  } else {
    alert(response.statusText);
  }
};

// ✅ Fix: Add event listener only if button exists
const logoutButton = document.querySelector('#logOutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
