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

        <div class="search-box">
          <i class="fa fa-search"></i>
          <input type="text" placeholder="Search for Movies, Events..." oninput="handleSearch(this.value)">
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

function handleSearch(query) {
  if (typeof searchMovies === 'function') searchMovies(query);
}
