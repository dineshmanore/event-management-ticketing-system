// api.js — homepage movie loading, category filtering, search
const API = 'http://localhost:5000/api';

let allMovies    = [];
let bannerIndex  = 0;
let bannerTimer  = null;
let activeGenre  = 'all';
let activeLang   = null;
let heroMovieId  = null;

// Read which category tab is active from URL
const urlParams  = new URLSearchParams(window.location.search);
const activeCat  = urlParams.get('cat') || 'movies';

// ── CATEGORY PAGES ──────────────────────────────────────────────────────
// Pages other than "movies" get an empty-state / coming-soon layout
const catConfig = {
  stream:     { title: 'Stream',     icon: 'fa-play-circle',    msg: 'Streaming content coming soon! Check back later.' },
  events:     { title: 'Events',     icon: 'fa-calendar-alt',   msg: 'No events found in your city right now. Check back soon!' },
  plays:      { title: 'Plays',      icon: 'fa-theater-masks',  msg: 'Theatre plays are coming to your city soon!' },
  sports:     { title: 'Sports',     icon: 'fa-futbol',         msg: 'Sports events will be listed here. Stay tuned!' },
  activities: { title: 'Activities', icon: 'fa-running',        msg: 'Activity listings are coming soon!' }
};

async function loadMovies() {
  try {
    const res = await fetch(`${API}/movies`);
    allMovies = await res.json();

    if (activeCat !== 'movies' && activeCat !== '') {
      renderCategoryPage(activeCat);
    } else {
      renderAll(allMovies);
      setupBanner(allMovies);
    }
  } catch (err) {
    console.error('Could not load movies:', err);
    showError('Could not connect to server. Make sure the backend is running on port 5000.');
  }
}

// ── CATEGORY EMPTY STATE ─────────────────────────────────────────────────
function renderCategoryPage(cat) {
  const cfg = catConfig[cat] || { title: cat, icon: 'fa-star', msg: 'Content coming soon!' };

  // Hide homepage sections, show a category view instead
  const hero = document.querySelector('.hero');
  const filterBar = document.querySelector('.filter-bar');
  if (hero)      hero.style.display = 'none';
  if (filterBar) filterBar.style.display = 'none';

  // Show category header + movies tagged with this category (if any)
  const catMovies = allMovies.filter(m =>
    m.category && m.category.toLowerCase() === cat.toLowerCase()
  );

  // Build the category section
  const sections = document.querySelectorAll('.section-wrap, .premiere-section');
  sections.forEach(s => s.style.display = 'none');

  const main = document.createElement('div');
  main.style.cssText = 'padding:40px;';
  main.innerHTML = `
    <h2 style="font-size:26px;font-weight:700;margin-bottom:6px">${cfg.title}</h2>
    <p style="color:#888;font-size:14px;margin-bottom:30px">Showing ${cfg.title.toLowerCase()} in your city</p>
  `;

  if (catMovies.length > 0) {
    const row = document.createElement('div');
    row.className = 'movie-row';
    row.innerHTML = catMovies.map(m => createMovieCard(m)).join('');
    main.appendChild(row);
  } else {
    main.innerHTML += `
      <div style="text-align:center;padding:80px 20px;background:white;border-radius:16px;border:1px solid #eee">
        <i class="fa ${cfg.icon}" style="font-size:64px;color:#e0e0e0;margin-bottom:20px;display:block"></i>
        <h3 style="font-size:20px;font-weight:600;margin-bottom:8px;color:#555">${cfg.msg}</h3>
        <p style="color:#aaa;font-size:14px;margin-bottom:24px">Meanwhile, check out our latest movies!</p>
        <a href="index.html?cat=movies"
           style="background:#cc0c39;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Browse Movies
        </a>
      </div>`;
  }

  // Insert before footer
  const footer = document.getElementById('footer');
  footer.parentNode.insertBefore(main, footer);
}

// ── RENDER ALL SECTIONS ──────────────────────────────────────────────────
function renderAll(movies) {
  const nowShowing  = movies.slice(0, 8);
  const recommended = movies.slice(0, 10);
  const premieres   = movies.slice(3, 9);
  const trending    = [...movies].sort((a, b) => b.votes - a.votes).slice(0, 8);

  renderRow(nowShowing,  'nowShowing');
  renderRow(recommended, 'recommended');
  renderRow(premieres,   'premieres');
  renderRow(trending,    'trending');
}

function renderRow(movies, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!movies || movies.length === 0) {
    el.innerHTML = '<p style="color:#aaa;padding:20px;font-size:14px">No movies found.</p>';
    return;
  }
  el.innerHTML = movies.map(m => createMovieCard(m)).join('');
}

// ── HERO BANNER ──────────────────────────────────────────────────────────
function setupBanner(movies) {
  if (!movies.length) return;
  showBanner(movies[0]);
  bannerIndex = 0;
  clearInterval(bannerTimer);
  bannerTimer = setInterval(() => {
    bannerIndex = (bannerIndex + 1) % movies.length;
    showBanner(movies[bannerIndex]);
  }, 5000);
}

function showBanner(movie) {
  heroMovieId = movie.id;
  const banner = document.getElementById('heroBanner');
  if (banner) {
    banner.style.backgroundImage = `url(${movie.banner || movie.poster})`;
    banner.style.backgroundSize  = 'cover';
    banner.style.backgroundPosition = 'center';
  }
  setText('heroTitle',       movie.title);
  setText('heroDescription', movie.description || 'An amazing cinematic experience.');
  setText('heroRating',      `★ ${movie.rating}`);
  setText('heroGenre',       movie.genre ? movie.genre.split(',')[0].trim() : '');
  setText('heroLang',        movie.language || '');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

// ── ACTIONS ──────────────────────────────────────────────────────────────
function bookHero() {
  if (!heroMovieId) return;
  if (!localStorage.getItem('token')) {
    alert('Please sign in to book tickets.');
    window.location.href = 'login.html';
    return;
  }
  localStorage.setItem('movieId', heroMovieId);
  window.location.href = `movie.html?id=${heroMovieId}`;
}

function openMovie(id) {
  console.log("Opening movie ID:",id);
  window.location.href = `movie.html?id=${id}`;
}

function scrollRow(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 320, behavior: 'smooth' });
}

// ── FILTER PILLS ─────────────────────────────────────────────────────────
function filterBy(btn, genre) {
  document.querySelectorAll('.filter-pill:not(.lang)').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  activeGenre = genre;
  applyFilters();
}

function filterLang(btn, lang) {
  const wasActive = btn.classList.contains('active');
  document.querySelectorAll('.filter-pill.lang').forEach(p => p.classList.remove('active'));
  if (!wasActive) { btn.classList.add('active'); activeLang = lang; }
  else            { activeLang = null; }
  applyFilters();
}

function applyFilters() {
  let filtered = [...allMovies];
  if (activeGenre && activeGenre !== 'all') {
    filtered = filtered.filter(m =>
      m.genre && m.genre.toLowerCase().includes(activeGenre.toLowerCase())
    );
  }
  if (activeLang) {
    filtered = filtered.filter(m =>
      m.language && m.language.toLowerCase().includes(activeLang.toLowerCase())
    );
  }
  renderAll(filtered);
  if (filtered.length > 0) setupBanner(filtered);
}

// ── SEARCH ────────────────────────────────────────────────────────────────
function searchMovies(query) {
  if (!query.trim()) { renderAll(allMovies); return; }
  const q = query.toLowerCase();
  const filtered = allMovies.filter(m =>
    m.title.toLowerCase().includes(q) ||
    (m.genre     && m.genre.toLowerCase().includes(q)) ||
    (m.language  && m.language.toLowerCase().includes(q))
  );
  renderAll(filtered);
}

// ── ERROR STATE ──────────────────────────────────────────────────────────
function showError(msg) {
  const hero = document.getElementById('heroBanner');
  if (hero) {
    hero.style.background = '#1a1a2e';
    hero.innerHTML = `
      <div style="color:white;padding:50px;text-align:center;width:100%">
        <i class="fa fa-exclamation-circle" style="font-size:40px;margin-bottom:16px;display:block;color:#cc0c39"></i>
        <p style="font-size:16px">${msg}</p>
      </div>`;
  }
}

// ── INIT ─────────────────────────────────────────────────────────────────
loadMovies();
