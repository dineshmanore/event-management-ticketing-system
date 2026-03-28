const API = 'http://localhost:5000/api';

// Redirect if already logged in
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const isAuthPage = window.location.pathname.includes('login.html') ||
                     window.location.pathname.includes('signup.html');
  if (token && isAuthPage) window.location.href = 'index.html';
});

function showError(msg) {
  const el = document.getElementById('errorMsg');
  if (el) { el.style.display = 'block'; el.innerText = msg; }
}

function hideError() {
  const el = document.getElementById('errorMsg');
  if (el) el.style.display = 'none';
}

async function signup() {
  hideError();
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!name || !email || !password) return showError('Please fill all required fields.');
  if (password.length < 6) return showError('Password must be at least 6 characters.');
  if (password !== confirmPassword) return showError('Passwords do not match.');

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.message === 'User created') {
      alert('Account created! Please sign in.');
      window.location.href = 'login.html';
    } else if (data === 'Email exists' || (data.message && data.message.includes('exists'))) {
      showError('This email is already registered. Please sign in.');
    } else {
      showError(data.message || 'Signup failed. Please try again.');
    }
  } catch (err) {
    showError('Server error. Please try again.');
  }
}

async function login() {
  hideError();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) return showError('Please enter your email and password.');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name || email.split('@')[0]);
      window.location.href = 'index.html';
    } else {
      showError(data.message || 'Invalid email or password.');
    }
  } catch (err) {
    showError('Server error. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}
