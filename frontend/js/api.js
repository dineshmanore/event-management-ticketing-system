// api.js — homepage movie loading, category filtering, search
var API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://event-management-ticketing-system.onrender.com/api';


let bannerIndex  = 0;
let bannerTimer  = null;
let activeGenre  = 'all';
let activeLang   = null;
let heroMovieId  = null;
let heroTrailer  = '';

const urlParams  = new URLSearchParams(window.location.search);
const activeCat  = urlParams.get('cat') || 'movies';

// loadMovies() below uses fetchWithCache which is defined globally in header.js
async function loadMovies() {
  try {
    let url = `${API}/movies`;
    const params = new URLSearchParams();
    if (activeGenre && activeGenre !== 'all') params.set('genre', activeGenre);
    if (activeLang) params.set('language', activeLang);
    if (activeCat && activeCat.toLowerCase() !== 'movies') params.set('category', activeCat);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const [movies, streams] = await Promise.all([
      fetchWithCache(url),
      fetchWithCache(`${API}/stream`)
    ]);

    if (activeCat && activeCat.toLowerCase() !== 'movies' && activeCat !== '') {
      renderCategoryPage(activeCat, movies);
    } else {
      renderAll(movies, streams);
      setupBanner(movies);
    }
  } catch (err) {
    console.error('Could not load movies:', err);
    showError('Could not connect to server. Make sure the backend is running on port 5000.');
  }
}

function renderCategoryPage(cat, catMovies) {
  const cfg = catConfig[cat] || { title: cat, icon: 'fa-star', msg: 'Content coming soon!' };
  // ... (rest of logic remains similar, but we use passed catMovies)
  const hero = document.querySelector('.hero');
  const filterBar = document.querySelector('.filter-bar');
  if (hero)      hero.style.display = 'none';
  if (filterBar) filterBar.style.display = 'none';

  const sections = document.querySelectorAll('.section-wrap, .premiere-section');
  sections.forEach(s => s.style.display = 'none');

  const main = document.createElement('div');
  main.style.cssText = 'padding:40px;';
  main.innerHTML = `
    <h2 style="font-size:26px;font-weight:700;margin-bottom:6px">${cfg.title}</h2>
    <p style="color:#888;font-size:14px;margin-bottom:30px">Showing ${cfg.title.toLowerCase()} in your city</p>
  `;

  if (catMovies && catMovies.length > 0) {
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
  const footer = document.getElementById('footer');
  footer.parentNode.insertBefore(main, footer);
}

// FIX #4: "Now Showing" and "Recommended" now use DIFFERENT datasets
// - nowShowing: latest/chronological order
// - recommended: sorted by rating (highest first) — genuinely different ranking
function renderAll(movies, streams) {
  if (!movies || movies.length === 0) {
    renderRow([], 'nowShowing');
    renderRow([], 'recommended');
    renderRow([], 'premieres');
    renderRow([], 'trending');
    return;
  }

  const nowShowing  = [...movies].sort((a,b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)).slice(0, 8);
  const recommended = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const trending    = [...movies].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 8);
  
  // Premieres now ONLY shows streams with Category 'Premiere'
  const premieres   = (streams || []).filter(s => s.category === 'Premiere').map(s => ({
    ...s,
    poster: s.poster_image,
    banner: s.banner_image,
    type: 'stream'
  })).slice(0, 8);

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

function setupBanner(movies) {
  clearInterval(bannerTimer);
  if (!movies || !movies.length) {
    showErrorBanner('No movies matching these filters found.');
    return;
  }
  showBanner(movies[0]);
  bannerIndex = 0;
  bannerTimer = setInterval(() => {
    bannerIndex = (bannerIndex + 1) % movies.length;
    showBanner(movies[bannerIndex]);
  }, 5000);
}

function showErrorBanner(msg) {
  const banner = document.getElementById('heroBanner');
  if (banner) {
    banner.style.backgroundImage = 'none';
    banner.style.background = '#1a1a2e';
  }
  setText('heroTitle', 'No Results');
  setText('heroDescription', msg || 'Try adjusting your filters to find what you are looking for.');
  setText('heroRating', '');
  setText('heroGenre', '');
  setText('heroLang', '');
  heroMovieId = null;
  heroTrailer = '';
}

function showBanner(movie) {
  heroMovieId = movie.id;
  heroTrailer = (movie && (movie.trailer_url || movie.trailer || movie.trailerUrl)) ? String(movie.trailer_url || movie.trailer || movie.trailerUrl).trim() : '';
  const banner = document.getElementById('heroBanner');
  if (banner) {
    banner.style.backgroundImage = `url(${movie.banner || movie.poster})`;
    banner.style.backgroundSize  = 'cover';
    banner.style.backgroundPosition = 'center';
  }
  setText('heroTitle',       movie.title);
  setText('heroDescription', movie.description || 'An amazing cinematic experience.');
  const ratingEl = document.getElementById('heroRating');
  if (ratingEl) {
    if (movie.rating && movie.rating > 0) {
      ratingEl.innerText = `★ ${movie.rating}`;
      ratingEl.style.display = 'inline-block';
    } else {
      ratingEl.style.display = 'none';
    }
  }
  setText('heroGenre',       movie.genre ? movie.genre.split(',')[0].trim() : '');
  setText('heroLang',        movie.language || '');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}

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

function scrollRow(id, dir) {
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * 320, behavior: 'smooth' });
}

function filterBy(btn, genre) {
  document.querySelectorAll('.filter-pill:not(.lang)').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  activeGenre = genre;
  
  // If 'All' is clicked, we also clear language filters for a fresh start
  if (genre === 'all') {
    activeLang = null;
    document.querySelectorAll('.filter-pill.lang').forEach(p => p.classList.remove('active'));
  }
  
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
  loadMovies();
}

async function searchMovies(query) {
  if (!query.trim()) { loadMovies(); return; }
  try {
    const res = await fetch(`${API}/movies/search?q=${encodeURIComponent(query)}`);
    const movies = await res.json();
    renderAll(movies);
    if (movies.length > 0) setupBanner(movies);
  } catch (err) {
    console.error('Search error:', err);
  }
}


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

function toEmbedUrl(url) {
  if (!url) return '';
  const ytWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/i);
  const ytShort = url.match(/youtu\.be\/([^?&]+)/i);
  const ytEmbed = url.match(/youtube\.com\/embed\/([^?&]+)/i);
  const ytId = (ytWatch && ytWatch[1]) || (ytShort && ytShort[1]) || (ytEmbed && ytEmbed[1]);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo && vimeo[1]) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;

  return url;
}

function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url || '');
}

function watchHeroTrailer() {
  const trailer = heroTrailer || '';
  if (!trailer) {
    alert('Trailer not available for this movie yet.');
    return;
  }

  const modal = document.getElementById('trailerModal');
  const wrap = document.getElementById('trailerFrameWrap');
  const titleEl = document.getElementById('trailerTitle');
  if (!modal || !wrap || !titleEl) {
    alert('Trailer player is missing on this page.');
    return;
  }

  const embedUrl = toEmbedUrl(trailer);
  titleEl.innerText = `${(document.getElementById('heroTitle')?.innerText || 'Movie')} — Trailer`;
  if (isDirectVideoUrl(trailer)) {
    wrap.innerHTML = `<video src="${trailer}" controls autoplay playsinline></video>`;
  } else {
    wrap.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  modal.classList.add('open');
}

function closeTrailer(e) {
  if (e && e.target && e.target.id !== 'trailerModal') return;
  const modal = document.getElementById('trailerModal');
  const wrap = document.getElementById('trailerFrameWrap');
  if (wrap) wrap.innerHTML = '';
  if (modal) modal.classList.remove('open');
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTrailer();
});

loadMovies();