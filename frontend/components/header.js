// header.js — updated with real category page links
(function () {
  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || '';
  const city     = localStorage.getItem('city') || 'Mumbai';

  // Detect active nav from current page filename
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  function navLink(label, href, pageName) {
    const isActive = page === pageName || (page === 'index' && pageName === 'movies');
    return `<a href="${href}" ${isActive ? 'class="active"' : ''}>${label}</a>`;
  }

  const authHTML = token
    ? `<div class="user-info">
         <div class="user-avatar">${(userName.charAt(0) || 'U').toUpperCase()}</div>
         <span style="font-size:14px;font-weight:500">${userName.split(' ')[0]}</span>
         <span class="logout-link" onclick="logout()">Logout</span>
       </div>`
    : `<a href="login.html" class="signin-btn">Sign In</a>`;

  const cities = ['Mumbai','Delhi NCR','Bangalore','Pune','Hyderabad','Chennai','Kolkata','Ahmedabad'];
  const cityOptions = cities.map(c =>
    `<option ${c === city ? 'selected' : ''}>${c}</option>`
  ).join('');

  document.getElementById('header').innerHTML = `
  <header class="header">
    <div class="top-header">
      <a href="index.html" class="logo">
        <div class="logo-box">ST</div>
        <span class="logo-text">ShowTime</span>
      </a>

      <div class="search-box">
        <i class="fa fa-search"></i>
        <input type="text" id="searchInput"
               placeholder="Search for Movies, Events, Plays, Sports and Activities"
               oninput="handleSearch(this.value)">
      </div>

      <div class="right-section">
        <select class="city-select" onchange="changeCity(this.value)">
          ${cityOptions}
        </select>
        ${authHTML}
      </div>
    </div>

    <nav class="nav-menu">
      ${navLink('Movies',     'index.html',     'movies')}
      ${navLink('Stream',     'stream.html',     'stream')}
      ${navLink('Events',     'events.html',     'events')}
      ${navLink('Plays',      'plays.html',      'plays')}
      ${navLink('Sports',     'sports.html',     'sports')}
      ${navLink('Activities', 'activities.html', 'activities')}
      ${token ? '<a href="dashboard.html" ' + (page==='dashboard'?'class="active"':'') + '>My Bookings</a>' : ''}
    </nav>
  </header>`;
})();

function changeCity(city) { localStorage.setItem('city', city); }
function handleSearch(query) { if (typeof searchMovies === 'function') searchMovies(query); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('userName'); window.location.href = 'index.html'; }
