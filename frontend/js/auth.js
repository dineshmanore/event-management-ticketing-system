
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
    console.log("FULL RESPONSE:", data);

    if (data.message === 'User created') {
      const card = document.querySelector('.auth-card');
      if (card) {
        card.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <i class="fas fa-paper-plane" style="font-size: 50px; color: #ff385c; margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px;">Check Your Email</h3>
            <p>We've sent a verification link to <strong>${email}</strong>.</p>
            <p>Please click the link in the email to activate your account.</p>
            <div style="margin-top: 30px;">
              <a href="login.html" class="auth-btn" style="text-decoration: none; display: inline-block;">Back to Login</a>
            </div>
          </div>
        `;
      } else {
        alert('Account created! Please check your email to verify your account.');
        window.location.href = 'login.html';
      }
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
  console.log("LOGIN CLICKED");

  hideError();

  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    return showError('Please enter your email and password.');
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("DATA:", data);

    if (res.ok && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } else if (res.status === 403) {
      showError(data.message || 'Please verify your email address.');
    } else {
      showError(data.message || 'Login failed. Please try again.');
    }

  } catch (err) {
    console.error("ERROR:", err);
    showError('Server error. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Google Sign-In Handler
async function handleGoogleResponse(response) {
  const credential = response.credential;
  if (!credential) return showError('Google login failed: no credential received.');

  try {
    const res = await fetch(`${API}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential })
    });

    const data = await res.json();
    
    if (res.ok && data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } else {
      showError(data.message || 'Google Sign-In failed');
    }
  } catch (err) {
    console.error('Google Auth Error:', err);
    showError('Server error during Google Sign-In.');
  }
}


