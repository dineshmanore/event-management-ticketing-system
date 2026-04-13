(function () {
  const token = localStorage.getItem('token');

  function safeParseUser() {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }

  async function ensureUserHydrated() {
    if (!token) return;
    const user = safeParseUser();
    if (user?.name) return;
    try {
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://event-management-ticketing-system.onrender.com/api';
      const res = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('showtime:user-updated'));
      }
    } catch {
      // ignore
    }
  }

  let user = safeParseUser();
  let userName = user.name || '';
  let role = user.role || '';
  const city = localStorage.getItem('city') || 'Mumbai';

  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  const spaCache = new Map(); // Global cache for SPA page content and assets
  
  // GLOBAL DATA CACHE (Shared across pages)
  window.apiDataCache = window.apiDataCache || new Map();
  window.fetchWithCache = async function(url) {
    if (window.apiDataCache.has(url)) return window.apiDataCache.get(url);
    const res = await fetch(url);
    const data = await res.json();
    window.apiDataCache.set(url, data);
    return data;
  };

  window.spaNavigate = async function(url, e) {
    if (e) e.preventDefault();
    if (url === window.location.pathname.split('/').pop()) return;

    const contentEl = document.getElementById('app-content');
    if (!contentEl) {
      window.location.href = url;
      return;
    }

    const loadPage = async (htmlText, isFromCache = false) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const newContent = doc.querySelector('#app-content');

      if (newContent) {
        // Handle Head Assets (CSS)
        document.querySelectorAll('.spa-head-asset').forEach(el => el.remove());
        const newHeadAssets = doc.querySelectorAll('head link[rel="stylesheet"], head style');
        newHeadAssets.forEach(asset => {
          if (asset.tagName === 'LINK') {
            const href = asset.getAttribute('href');
            if (document.querySelector(`link[href="${href}"]`)) return;
          }
          const clonedAsset = asset.cloneNode(true);
          clonedAsset.classList.add('spa-head-asset');
          document.head.appendChild(clonedAsset);
        });

        contentEl.innerHTML = newContent.innerHTML;
        document.title = doc.title;
        if (!isFromCache) history.pushState({ spa: true }, '', url);
        
        updateNavState();

        // Re-execute scripts
        document.querySelectorAll('.spa-script').forEach(s => s.remove());
        const scripts = doc.querySelectorAll('body script');
        
        scripts.forEach(oldScript => {
          if (oldScript.src && (oldScript.src.includes('header.js') || oldScript.src.includes('footer.js'))) return;
          const newScript = document.createElement('script');
          newScript.classList.add('spa-script');
          
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            let content = oldScript.innerHTML;
            content = content.replace(/\bconst\s+API\b/g, 'var API');
            content = content.replace(/\bconst\s+params\b/g, 'var params');
            content = content.replace(/\bconst\s+urlParams\b/g, 'var urlParams');
            content = content.replace(/\bconst\s+catIcons\b/g, 'var catIcons');
            content = content.replace(/\bconst\s+catColors\b/g, 'var catColors');
            content = content.replace(/\bconst\s+catConfig\b/g, 'var catConfig');
            content = content.replace(/\blet\s+allEvents\b/g, 'var allEvents');
            content = content.replace(/\blet\s+movies\b/g, 'var movies');
            content = content.replace(/\blet\s+currentMovie\b/g, 'var currentMovie');
            newScript.innerHTML = content;
          }
          Array.from(oldScript.attributes).forEach(attr => {
            if (attr.name !== 'src') newScript.setAttribute(attr.name, attr.value);
          });
          document.body.appendChild(newScript);
        });

        if (!isFromCache) window.scrollTo({ top: 0, behavior: 'smooth' });
        return true;
      }
      return false;
    };

    try {
      // Check cache first for INSTANT loading
      if (spaCache.has(url)) {
        console.log('SPA: Loading from cache...', url);
        await loadPage(spaCache.get(url), true);
        // We still fetch in background to keep data fresh, but without spinner
        fetch(url).then(res => res.text()).then(text => spaCache.set(url, text));
        return;
      }

      // 1. Show Spinner only if NOT in cache
      const loader = document.createElement('div');
      loader.className = 'spa-loader-wrap';
      loader.innerHTML = '<div class="spa-spinner"></div><div class="spa-loader-text">Loading...</div>';
      document.body.appendChild(loader);

      contentEl.style.opacity = '0.3';
      contentEl.style.transition = 'opacity 0.2s ease-out';

      const res = await fetch(url);
      const text = await res.text();
      spaCache.set(url, text); // Save to cache

      const success = await loadPage(text);
      if (!success) window.location.href = url;

    } catch (err) {
      console.error('SPA Nav error:', err);
      window.location.href = url;
    } finally {
      document.querySelectorAll('.spa-loader-wrap').forEach(el => el.remove());
      if (contentEl) {
        contentEl.style.opacity = '1';
        contentEl.classList.add('fade-in');
        setTimeout(() => contentEl.classList.remove('fade-in'), 300);
      }
    }
  };

  function updateNavState() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html','') || 'index';
    
    // Update active class on links
    document.querySelectorAll('.nav-menu a').forEach(a => {
      const href = a.getAttribute('href');
      const pageName = href? href.replace('.html', '') : '';
      const isActive = currentPage === pageName || (currentPage === 'index' && pageName === 'movies');
      a.className = isActive ? 'active' : '';
    });

    // Update search box visibility
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.style.display = ['events','plays','sports','activities'].includes(currentPage) ? 'none' : 'flex';
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    location.reload(); 
  });

  function navLink(label, href, pageName) {
    const currentPage = window.location.pathname.split('/').pop().replace('.html','') || 'index';
    const isActive = currentPage === pageName || (currentPage === 'index' && pageName === 'movies');
    return `<a href="${href}" ${isActive ? 'class="active"' : ''} onclick="spaNavigate('${href}', event)">${label}</a>`;
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

        <a href="profile.html"><i class="fa fa-user" style="width:18px;margin-right:8px;color:#cc0c39"></i>My Profile</a>
        <a href="dashboard.html"><i class="fa fa-ticket-alt" style="width:18px;margin-right:8px;color:#cc0c39"></i>My Bookings</a>
        ${role === 'admin' ? '<a href="admin.html"><i class="fa fa-gear" style="width:18px;margin-right:8px;color:#cc0c39"></i>Admin Panel</a>' : ''}

        <div class="divider"></div>
        <span onclick="logout()"><i class="fa fa-right-from-bracket" style="width:18px;margin-right:8px;color:#888"></i>Logout</span>
      </div>
    </div>
    `
    : `<a href="login.html" class="signin-btn">Sign In</a>`;

  function renderHeader() {
    user = safeParseUser();
    userName = user.name || '';
    role = user.role || '';

    const headerEl = document.getElementById('header');
    if (!headerEl) return;

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

          <a href="profile.html"><i class="fa fa-user" style="width:18px;margin-right:8px;color:#cc0c39"></i>My Profile</a>
          <a href="dashboard.html"><i class="fa fa-ticket-alt" style="width:18px;margin-right:8px;color:#cc0c39"></i>My Bookings</a>
          ${role === 'admin' ? '<a href="admin.html"><i class="fa fa-gear" style="width:18px;margin-right:8px;color:#cc0c39"></i>Admin Panel</a>' : ''}

          <div class="divider"></div>
          <span onclick="logout()"><i class="fa fa-right-from-bracket" style="width:18px;margin-right:8px;color:#888"></i>Logout</span>
        </div>
      </div>
      `
      : `<a href="login.html" class="signin-btn">Sign In</a>`;

    headerEl.innerHTML = `
    <header class="header">
      <div class="top-header">

        <a href="index.html" class="logo" onclick="spaNavigate('index.html', event)">
          <img src="logo.png" alt="ShowTime" style="height: 48px; width: 48px; object-fit: contain; border-radius: 8px;">
          <span class="logo-text">ShowTime</span>
        </a>

        <div class="search-box" style="position:relative; display: ${['events','plays','sports','activities'].includes(page) ? 'none' : 'flex'}">
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
  }

  renderHeader();
  window.addEventListener('showtime:user-updated', renderHeader);
  ensureUserHydrated();
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
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  const container = document.getElementById('searchResults');
  if (!query.trim()) {
    container.style.display = 'none';
    return;
  }
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://event-management-ticketing-system.onrender.com/api';
      const res = await fetch(`${apiBase}/movies/search?q=${encodeURIComponent(query)}&category=${page}`);
      if (!res.ok) throw new Error('Search failed');
      const results = await res.json();
      
      if (results.length === 0) {
        container.innerHTML = `<div style="padding:16px;color:#888;font-size:14px;text-align:center">No results found</div>`;
      } else {
        container.innerHTML = results.map(m => `
          <a href="${m.is_event ? 'event-booking.html' : 'movie.html'}?id=${m.id}" 
             onclick="spaNavigate('${m.is_event ? 'event-booking.html' : 'movie.html'}?id=${m.id}', event); document.getElementById('searchResults').style.display='none';"
             style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;color:var(--text);border-bottom:1px solid #eee;transition:background .2s">
            <img src="${m.poster || m.image || 'https://via.placeholder.com/40x60'}" style="width:40px;height:60px;object-fit:cover;border-radius:6px">
            <div>
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#111">${m.title}</div>
              <div style="font-size:12px;color:#777">${m.genre || m.category || ''} • ${m.rating ? '★ ' + m.rating : (m.city || '')}</div>
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
