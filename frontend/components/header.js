(function () {
  const token = localStorage.getItem('token');

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    user = {};
  }

  const userName = user.name || '';
  const role = user.role || '';
  const city = localStorage.getItem('city') || 'Mumbai';

  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  function navLink(label, href, pageName) {
    const isActive = page === pageName || (page === 'index' && pageName === 'movies');
    return `<a href="${href}" ${isActive ? 'class="active"' : ''}>${label}</a>`;
  }

  const cities = ['Mumbai','Delhi NCR','Bangalore','Pune','Hyderabad','Chennai','Kolkata','Ahmedabad'];

  const authHTML = token
    ? `
    <div class="user-menu" onclick="toggleMenu(event)">
      <div class="user-avatar">
        ${(userName.charAt(0) || 'U').toUpperCase()}
      </div>
      <span class="user-name">${userName.split(' ')[0]}</span>

      <div id="dropdownMenu" class="dropdown hidden">

        <div class="dropdown-header">
          <div class="avatar-big">
            ${(userName.charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <div class="name">${userName}</div>
            <div class="role">${role}</div>
          </div>
        </div>

        <a href="dashboard.html">🎟 My Bookings</a>
        ${role === 'admin' ? '<a href="admin.html">⚙ Admin Panel</a>' : ''}

        <div class="divider"></div>
        <span onclick="logout()">🚪 Logout</span>
      </div>
    </div>
    `
    : `<a href="login.html" class="signin-btn">Sign In</a>`;

  const headerEl = document.getElementById('header');
  if (!headerEl) return;

  headerEl.innerHTML = `
    <header class="header">
      <div class="top-header">

        <a href="index.html" class="logo">
          <div class="logo-box">ST</div>
          <span class="logo-text">ShowTime</span>
        </a>

        <div class="search-box" style="position:relative">
          <i class="fa fa-search"></i>
          <input type="text" placeholder="Search for Movies, Events..." oninput="handleSearch(this.value)" autocomplete="off">
          <div id="searchResults" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);max-height:380px;overflow-y:auto;z-index:9999;margin-top:12px;width:350px;"></div>
        </div>

        <div class="right-section">

          <!-- CITY DROPDOWN -->
          <div class="city-dropdown" onclick="toggleCityDropdown(event)">
            <span id="selectedCity">${city}</span>
            <span class="arrow">▼</span>

            <div id="cityMenu" class="city-menu hidden">
              ${cities.map(c => `<div onclick="selectCity('${c}')">${c}</div>`).join('')}
            </div>
          </div>

          ${authHTML}

        </div>
      </div>

      <nav class="nav-menu">
        ${navLink('Movies','index.html','movies')}
        ${navLink('Stream','stream.html','stream')}
        ${navLink('Events','events.html','events')}
        ${navLink('Plays','plays.html','plays')}
        ${navLink('Sports','sports.html','sports')}
        ${navLink('Activities','activities.html','activities')}
      </nav>
    </header>
  `;
})();

function toggleMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("dropdownMenu");
  if (menu) menu.classList.toggle("hidden");
}

function toggleCityDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById("cityMenu");
  if (menu) menu.classList.toggle("hidden");
}

function selectCity(city) {
  localStorage.setItem("city", city);
  location.reload();
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".user-menu")) {
    const menu = document.getElementById("dropdownMenu");
    if (menu) menu.classList.add("hidden");
  }

  if (!e.target.closest(".city-dropdown")) {
    const menu = document.getElementById("cityMenu");
    if (menu) menu.classList.add("hidden");
  }
});

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

let searchTimeout;
async function handleSearch(query) {
  const container = document.getElementById('searchResults');
  if (!query.trim()) {
    container.style.display = 'none';
    return;
  }
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/movies/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const results = await res.json();
      
      if (results.length === 0) {
        container.innerHTML = '<div style="padding:16px;color:#888;font-size:14px;text-align:center">No movies found</div>';
      } else {
        container.innerHTML = results.map(m => `
          <a href="movie.html?id=${m.id}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;color:var(--text);border-bottom:1px solid #eee;transition:background .2s">
            <img src="${m.poster || 'https://via.placeholder.com/40x60'}" style="width:40px;height:60px;object-fit:cover;border-radius:6px">
            <div>
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#111">${m.title}</div>
              <div style="font-size:12px;color:#777">${m.genre || ''} • ★ ${m.rating || 0}</div>
            </div>
          </a>
        `).join('');
      }
      container.style.display = 'block';
    } catch(e) {
      console.error(e);
      container.style.display = 'none';
    }
  }, 300);
}

// Close search if clicked outside
window.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box')) {
    const r = document.getElementById('searchResults');
    if (r) r.style.display = 'none';
  }
});
