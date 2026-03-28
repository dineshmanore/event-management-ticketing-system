// header.js — runs immediately, injects header HTML
(function () {
  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || '';
  const city     = localStorage.getItem('city') || 'Mumbai';

  // figure out which nav link is active from URL param
  const cat = new URLSearchParams(window.location.search).get('cat') || 'movies';

  function navLink(label, href, catKey) {
    const active = cat === catKey ? 'class="active"' : '';
    return `<a href="${href}" ${active}>${label}</a>`;
  }

  const authHTML = token
    ? `<div class="user-info">
         <div class="user-avatar">${userName.charAt(0).toUpperCase() || 'U'}</div>
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
      ${navLink('Movies',     'index.html?cat=movies',     'movies')}
      ${navLink('Stream',     'index.html?cat=stream',     'stream')}
      ${navLink('Events',     'index.html?cat=events',     'events')}
      ${navLink('Plays',      'index.html?cat=plays',      'plays')}
      ${navLink('Sports',     'index.html?cat=sports',     'sports')}
      ${navLink('Activities', 'index.html?cat=activities', 'activities')}
      ${token ? '<a href="dashboard.html">My Bookings</a>' : ''}
    </nav>
  </header>`;
})();

function changeCity(city) {
  localStorage.setItem('city', city);
}

function handleSearch(query) {
  if (typeof searchMovies === 'function') searchMovies(query);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}
