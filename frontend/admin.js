// admin.js — ShowTime Admin Panel
const API       = 'http://localhost:5000/api';
const ADMIN_API = `${API}/admin`;

let moviesData = [], eventsData = [], bookingsData = [], usersData = [], streamsData = [];
let deleteTarget = null;

// ── NAVIGATION ──────────────────────────────────────────────────────────
function goto(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('onclick') === `goto('${page}')`) {
      item.classList.add('active');
    }
  });

  document.getElementById('pageTitle').innerText =
    page.charAt(0).toUpperCase() + page.slice(1);

  if (page === 'bookings') renderBookings();
  if (page === 'movies')   renderMovies();
  if (page === 'events')   renderEvents();
  if (page === 'streams')  renderStreams();
  if (page === 'users')    renderUsers();
  if (page === 'reports')  renderReports();
}

// ── LOAD ALL DATA ────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const token = localStorage.getItem('token');
    const authH = { Authorization: 'Bearer ' + token };

    const [mRes, eRes, bRes, uRes, sRes] = await Promise.all([
      fetch(`${API}/movies`),
      fetch(`${API}/events`).catch(() => ({ json: () => [] })),
      fetch(`${ADMIN_API}/bookings`, { headers: authH }).catch(() => ({ json: () => [] })),
      fetch(`${ADMIN_API}/users`,    { headers: authH }).catch(() => ({ json: () => [] })),
      fetch(`${API}/stream`).catch(() => ({ json: () => [] }))
    ]);

    moviesData   = await mRes.json().catch(() => []);
    eventsData   = typeof eRes.json === 'function' ? await eRes.json().catch(() => []) : [];
    bookingsData = typeof bRes.json === 'function' ? await bRes.json().catch(() => []) : [];
    usersData    = typeof uRes.json === 'function' ? await uRes.json().catch(() => []) : [];
    streamsData  = typeof sRes.json === 'function' ? await sRes.json().catch(() => []) : [];

    updateCounts();
    renderDashboard();
    renderMovies();
    renderEvents();
    renderBookings();
    renderUsers();
  } catch (e) {
    console.error(e);
  }
}

function updateCounts() {
  document.getElementById('movieCount').innerText   = moviesData.length;
  document.getElementById('eventCount').innerText   = eventsData.length;
  document.getElementById('streamCount').innerText  = streamsData.length;
  document.getElementById('bookingCount').innerText = bookingsData.length;
  document.getElementById('userCount').innerText    = usersData.length;
  document.getElementById('statMovies').innerText   = moviesData.length;
  document.getElementById('statBookings').innerText = bookingsData.length;
  document.getElementById('statUsers').innerText    = usersData.length;
  document.getElementById('statRevenue').innerText  =
    '₹' + bookingsData.reduce((s, b) => s + (parseFloat(b.total_price) || 0), 0)
             .toLocaleString('en-IN');
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function renderDashboard() {
  const tbody  = document.getElementById('recentBookings');
  const recent = bookingsData.slice(0, 5);
  tbody.innerHTML = recent.length
    ? recent.map(b => `
        <tr>
          <td style="font-weight:600">#${b.id}</td>
          <td>${b.name || 'User #' + b.user_id}</td>
          <td>${b.title || 'Movie #' + b.movie_id}</td>
          <td>${b.seats}</td>
          <td style="font-weight:600;color:#cc0c39">₹${b.total_price}</td>
          <td><span class="badge paid">Confirmed</span></td>
        </tr>`).join('')
    : '<tr class="empty-row"><td colspan="6"><i class="fa fa-inbox" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No bookings yet</td></tr>';

  const byMovie = {};
  bookingsData.forEach(b => {
    const t = b.title || 'Unknown';
    byMovie[t] = (byMovie[t] || 0) + 1;
  });
  const sorted = Object.entries(byMovie).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxVal = sorted[0]?.[1] || 1;
  document.getElementById('bookingsChart').innerHTML = sorted.length
    ? sorted.map(([t, v]) => `
        <div class="bar-row">
          <div class="bar-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${t}">${t}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxVal * 100)}%"></div></div>
          <div class="bar-val">${v}</div>
        </div>`).join('')
    : '<div style="color:#aaa;font-size:13px;padding:20px 0;text-align:center">No booking data yet</div>';

  const acts = [...bookingsData].slice(-5).reverse().map(b => ({
    text:  `New booking for <b>${b.title || 'a movie'}</b>`,
    time:  new Date(b.booking_time || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    color: '#1dc26b'
  }));
  document.getElementById('activityList').innerHTML = acts.length
    ? acts.map(a => `
        <div class="act-item">
          <div class="act-dot" style="background:${a.color}"></div>
          <div class="info">${a.text}</div>
          <div class="time">${a.time}</div>
        </div>`).join('')
    : '<div style="color:#aaa;font-size:13px">No recent activity</div>';
}

// ── MOVIES TABLE ─────────────────────────────────────────────────────────
function renderMovies(data) {
  const list  = data || moviesData;
  const tbody = document.getElementById('moviesTable');
  document.getElementById('movieTotalBadge').innerText = `(${list.length} total)`;
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><i class="fa fa-film" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No movies. Add one!</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(m => `
    <tr data-search="${m.title} ${m.genre} ${m.language}">
      <td><img class="thumb" src="${m.poster}" onerror="this.style.display='none'" alt=""></td>
      <td style="font-weight:600;max-width:200px">${m.title}</td>
      <td>${m.genre || '—'}</td>
      <td>${m.language || '—'}</td>
      <td><span style="color:#f84464;font-weight:600">★ ${m.rating}</span></td>
      <td>${(m.votes || 0) >= 1000 ? ((m.votes / 1000).toFixed(1) + 'K') : m.votes || 0}</td>
      <td><span class="badge active">Active</span></td>
      <td><div class="action-btns">
        <button class="btn-edit"   onclick="editMovie(${m.id})"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn-delete" onclick="confirmDelete('movie',${m.id},'${(m.title || '').replace(/'/g, "\\'")}')">
          <i class="fa fa-trash"></i> Delete
        </button>
      </div></td>
    </tr>`).join('');
}

// ── EVENTS TABLE ─────────────────────────────────────────────────────────
function renderEvents(data) {
  const list  = data || eventsData;
  const tbody = document.getElementById('eventsTable');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><i class="fa fa-calendar-alt" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No events. Add one!</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(e => `
    <tr data-search="${e.title} ${e.category} ${e.city}">
      <td>${e.image ? `<img class="thumb" src="${e.image}" onerror="this.style.display='none'" alt="">` : ''}</td>
      <td style="font-weight:600;max-width:180px">${e.title}</td>
      <td><span class="badge active">${e.category || 'event'}</span></td>
      <td>${e.city || '—'}</td>
      <td>${e.date ? new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</td>
      <td>₹${e.price_from || 0}</td>
      <td><span class="badge ${e.status === 'inactive' ? 'inactive' : 'active'}">${e.status || 'active'}</span></td>
      <td><div class="action-btns">
        <button class="btn-edit"   onclick="editEvent(${e.id})"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn-delete" onclick="confirmDelete('event',${e.id},'${(e.title || '').replace(/'/g, "\\'")}')">
          <i class="fa fa-trash"></i> Delete
        </button>
      </div></td>
    </tr>`).join('');
}

// ── STREAMS TABLE ─────────────────────────────────────────────────────────
function renderStreams(data) {
  const list  = data || streamsData;
  const tbody = document.getElementById('streamsTable');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><i class="fa fa-play-circle" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No streams. Add one!</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr data-search="${s.title} ${s.language} ${s.genres}">
      <td><img class="thumb" src="${s.poster_image}" onerror="this.style.display='none'" alt=""></td>
      <td style="font-weight:600;max-width:180px">${s.title}</td>
      <td>${s.language || '—'}</td>
      <td>${s.release_date ? new Date(s.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</td>
      <td>₹${s.price_rent || 0}</td>
      <td>₹${s.price_buy || 0}</td>
      <td><span class="badge ${s.status === 'inactive' ? 'inactive' : 'active'}">${s.status || 'active'}</span></td>
      <td><div class="action-btns">
        <button class="btn-delete" onclick="confirmDelete('stream',${s.id},'${(s.title || '').replace(/'/g, "\\'")}')">
          <i class="fa fa-trash"></i> Delete
        </button>
      </div></td>
    </tr>`).join('');
}

function renderBookings(data) {
  const list  = data || bookingsData;
  const tbody = document.getElementById('bookingsTable');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7"><i class="fa fa-ticket-alt" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No bookings yet</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(b => `
    <tr data-search="${b.name || ''} ${b.title || ''} ${b.seats}">
      <td style="font-weight:600">#${b.id}</td>
      <td>${b.name || 'User #' + b.user_id}</td>
      <td>${b.title || 'Movie #' + b.movie_id}</td>
      <td style="font-size:12px">${b.seats}</td>
      <td style="font-weight:600;color:#cc0c39">₹${b.total_price}</td>
      <td style="font-size:13px;color:#333;font-weight:600">
        ${b.show_date ? new Date(b.show_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (b.booking_time ? new Date(b.booking_time).toLocaleDateString('en-IN') : '—')}
      </td>
      <td><span class="badge paid">Confirmed</span></td>
    </tr>`).join('');
}

// ── USERS TABLE ───────────────────────────────────────────────────────────
function renderUsers(data) {
  const list  = data || usersData;
  const tbody = document.getElementById('usersTable');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6"><i class="fa fa-users" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No users yet</td></tr>';
    return;
  }
  const bookingMap = {};
  bookingsData.forEach(b => { bookingMap[b.user_id] = (bookingMap[b.user_id] || 0) + 1; });

  tbody.innerHTML = list.map(u => `
    <tr data-search="${u.name} ${u.email}">
      <td>
        <div style="width:36px;height:36px;background:#cc0c39;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">
          ${(u.name || 'U').charAt(0).toUpperCase()}
        </div>
      </td>
      <td style="font-weight:600">${u.name || '—'}</td>
      <td style="color:#888">${u.email}</td>
      <td style="font-size:12px;color:#888">${u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
      <td>${bookingMap[u.id] || 0}</td>
      <td><button class="btn-view"><i class="fa fa-eye"></i> View</button></td>
    </tr>`).join('');
}

// ── REPORTS ───────────────────────────────────────────────────────────────
function renderReports() {
  const byGenre = {};
  bookingsData.forEach(b => {
    const genre = (b.genre || 'Unknown').split(',')[0].trim();
    byGenre[genre] = (byGenre[genre] || 0) + 1;
  });
  const genreSorted = Object.entries(byGenre).sort((a, b) => b[1] - a[1]);
  const gMax = genreSorted[0]?.[1] || 1;
  document.getElementById('genreChart').innerHTML = genreSorted.length
    ? genreSorted.map(([g, v]) => `
        <div class="bar-row">
          <div class="bar-label">${g}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / gMax * 100)}%"></div></div>
          <div class="bar-val">${v}</div>
        </div>`).join('')
    : '<div style="color:#aaa;font-size:13px;text-align:center;padding:20px">No data</div>';

  const topMovies = moviesData.map(m => ({
    ...m,
    bookingCount: bookingsData.filter(b => b.movie_id === m.id).length,
    revenue:      bookingsData.filter(b => b.movie_id === m.id).reduce((s, b) => s + (parseFloat(b.total_price) || 0), 0)
  })).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5);

  document.getElementById('topMoviesTable').innerHTML = topMovies.length
    ? topMovies.map((m, i) => `
        <tr>
          <td style="font-weight:700;color:#cc0c39">#${i + 1}</td>
          <td style="font-weight:600">${m.title}</td>
          <td>${m.bookingCount}</td>
          <td style="font-weight:700;color:#1dc26b">₹${m.revenue.toLocaleString('en-IN')}</td>
        </tr>`).join('')
    : '<tr class="empty-row"><td colspan="4">No data</td></tr>';
}

// ── CAST SYSTEM ────────────────────────────────────────────────────────────
let allActors    = [];
let selectedCast = [];

// FIX #3: loadActors now returns a Promise so callers can await it
async function loadActors() {
  try {
    const res = await fetch(`${ADMIN_API}/actors`);
    if (!res.ok) throw new Error('Failed');
    allActors = await res.json();
    renderActorChips();
  } catch (e) {
    console.warn('Actors load failed:', e.message);
  }
}

function renderActorChips() {
  const container = document.getElementById('actorChips');
  if (!container) return;

  container.innerHTML = allActors.map(a => {
    const isSelected = selectedCast.some(s => s.actor_id === a.id);
    return `
      <div onclick="toggleActor(${a.id}, '${a.name.replace(/'/g,"\\'")}')">
        ${isSelected
          ? `<span style="display:inline-flex;align-items:center;gap:6px;background:#cc0c39;color:white;padding:6px 12px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer">
               ${a.name}
               <span onclick="event.stopPropagation();removeActor(${a.id})" style="font-size:16px;line-height:1;opacity:.8;cursor:pointer">&times;</span>
             </span>`
          : `<span style="display:inline-flex;align-items:center;background:#f0f0f0;color:#555;padding:6px 12px;border-radius:20px;font-size:13px;cursor:pointer;transition:background .15s" onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f0f0f0'">
               ${a.name}
             </span>`
        }
      </div>`;
  }).join('');

  renderRoleInputs();
}

function toggleActor(actorId, actorName) {
  const exists = selectedCast.some(s => s.actor_id === actorId);
  if (exists) return;
  selectedCast.push({ actor_id: actorId, name: actorName, role: '' });
  renderActorChips();
}

function removeActor(actorId) {
  selectedCast = selectedCast.filter(s => s.actor_id !== actorId);
  renderActorChips();
}

function renderRoleInputs() {
  const container = document.getElementById('rolesContainer');
  if (!container) return;
  if (!selectedCast.length) {
    container.innerHTML = '<p style="color:#aaa;font-size:13px">Select actors above to assign roles.</p>';
    return;
  }
  container.innerHTML = selectedCast.map((s, i) => `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <span style="width:150px;font-size:13px;font-weight:600;flex-shrink:0">${s.name}</span>
      <input
        type="text"
        class="role-input"
        data-index="${i}"
        placeholder="Role (e.g. Hero, Villain)"
        value="${s.role || ''}"
        oninput="selectedCast[${i}].role = this.value"
        style="flex:1;padding:8px 12px;border:1.5px solid #e0e0e0;border-radius:6px;font-size:13px;font-family:'Poppins',sans-serif;outline:none"
      >
    </div>`).join('');
}

function getCastData() {
  return selectedCast.map(s => ({
    actor_id: s.actor_id,
    role:     (s.role || '').trim() || 'Unknown'
  }));
}

// ── MOVIE CRUD ────────────────────────────────────────────────────────────
// FIX #3: openMovieModal no longer resets selectedCast = [] blindly.
// It only resets for NEW movies. For edits, editMovie() pre-populates
// selectedCast BEFORE this function runs, so we must not wipe it here.
function openMovieModal(movie) {
  if (!movie) {
    // Only reset cast when ADDING a new movie, not when EDITING
    selectedCast = [];
  }

  document.getElementById('editMovieId').value        = movie?.id || '';
  document.getElementById('movieModalTitle').innerText = movie ? 'Edit Movie' : 'Add Movie';
  document.getElementById('mTitle').value             = movie?.title || '';
  document.getElementById('mGenre').value             = movie?.genre || '';
  document.getElementById('mLang').value              = movie?.language || '';
  document.getElementById('mRating').value            = movie?.rating || '';
  document.getElementById('mVotes').value             = movie?.votes || '';
  document.getElementById('mPremiere').checked        = (movie?.category === 'Premiere');
  document.getElementById('mPoster').value            = movie?.poster || '';
  document.getElementById('mBanner').value            = movie?.banner || '';
  document.getElementById('mDesc').value              = movie?.description || '';

  const prev = document.getElementById('mPosterPreview');
  if (movie?.poster) { prev.src = movie.poster; prev.style.display = 'block'; }
  else prev.style.display = 'none';

  // Load actors — when done, renderActorChips() runs and highlights
  // already-selected cast members (selectedCast was set by editMovie before this call)
  loadActors();

  document.getElementById('movieModal').classList.add('open');
}

// FIX #3: editMovie now loads actors FIRST (awaits the fetch), THEN sets
// selectedCast, THEN opens the modal. This guarantees allActors is populated
// when we try to match actor names to IDs for pre-selection.
async function editMovie(id) {
  try {
    // Step 1: Ensure actors are loaded so name→id lookup works
    if (allActors.length === 0) {
      const actRes = await fetch(`${ADMIN_API}/actors`);
      allActors = await actRes.json();
    }

    // Step 2: Fetch the movie with its existing cast
    const res   = await fetch(`${API}/movies/${id}`);
    const movie = await res.json();

    // Step 3: Pre-populate selectedCast BEFORE openMovieModal runs
    // (openMovieModal no longer resets selectedCast when movie is passed in)
    selectedCast = (movie.cast || []).map(c => ({
      actor_id: allActors.find(a => a.name === c.name)?.id || 0,
      name:     c.name,
      role:     c.role || ''
    })).filter(c => c.actor_id !== 0);

    // Step 4: Open modal — selectedCast is intact, loadActors() inside will
    // re-render chips and show the pre-selected actors highlighted in red
    openMovieModal(movie);

  } catch (e) {
    console.error('Could not load movie for edit:', e);
    alert('Could not load movie data. Please try again.');
  }
}

async function saveMovie() {
  const id    = document.getElementById('editMovieId').value;
  const title = document.getElementById('mTitle').value.trim();
  if (!title) { alert('Title is required.'); return; }

  const payload = {
    title,
    genre:       document.getElementById('mGenre').value,
    language:    document.getElementById('mLang').value,
    rating:      parseFloat(document.getElementById('mRating').value) || 0,
    votes:       parseInt(document.getElementById('mVotes').value) || 0,
    category:    document.getElementById('mPremiere').checked ? 'Premiere' : 'Movies',
    poster:      document.getElementById('mPoster').value,
    banner:      document.getElementById('mBanner').value,
    description: document.getElementById('mDesc').value,
    cast:        getCastData()
  };

  try {
    const token  = localStorage.getItem('token');
    const url    = id ? `${ADMIN_API}/movies/${id}` : `${ADMIN_API}/movies`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Save failed');
    }

    closeModal('movieModal');
    await refreshMovies();
    alert(id ? 'Movie updated!' : 'Movie added!');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function refreshMovies() {
  const res  = await fetch(`${API}/movies`);
  moviesData = await res.json();
  renderMovies();
  renderDashboard();
  updateCounts();
}

// ── EVENT CRUD ────────────────────────────────────────────────────────────
function openEventModal(ev) {
  document.getElementById('editEventId').value         = ev?.id || '';
  document.getElementById('eventModalTitle').innerText = ev ? 'Edit Event' : 'Add Event';
  document.getElementById('eTitle').value              = ev?.title || '';
  document.getElementById('eCat').value                = ev?.category || 'concert';
  document.getElementById('eCity').value               = ev?.city || 'Mumbai';
  document.getElementById('eVenue').value              = ev?.venue || '';
  document.getElementById('eDate').value               = ev?.date?.split('T')[0] || '';
  document.getElementById('eTime').value               = ev?.time
    ? ev.time.replace(' ', '').replace(/(\d+):(\d+)\s*(AM|PM)/i, (m, h, min, ap) =>
        `${ap === 'PM' && h !== '12' ? String(parseInt(h) + 12).padStart(2, '0') : h.padStart(2, '0')}:${min}`)
    : '';
  document.getElementById('ePriceFrom').value  = ev?.price_from || '';
  document.getElementById('ePriceTo').value    = ev?.price_to || '';
  document.getElementById('eLang').value       = ev?.language || '';
  document.getElementById('eAge').value        = ev?.age_limit || 'All Ages';
  document.getElementById('eImage').value      = ev?.image || '';
  document.getElementById('eDesc').value       = ev?.description || '';

  const prev = document.getElementById('eImgPreview');
  if (ev?.image) { prev.src = ev.image; prev.style.display = 'block'; }
  else prev.style.display = 'none';

  document.getElementById('eventModal').classList.add('open');
}

function editEvent(id) { openEventModal(eventsData.find(e => e.id === id)); }

async function saveEvent() {
  const id    = document.getElementById('editEventId').value;
  const title = document.getElementById('eTitle').value.trim();
  if (!title) { alert('Title is required.'); return; }

  const timeVal       = document.getElementById('eTime').value;
  const formattedTime = timeVal
    ? (() => { const [h, m] = timeVal.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })()
    : '';

  const payload = {
    title,
    category:    document.getElementById('eCat').value,
    city:        document.getElementById('eCity').value,
    venue:       document.getElementById('eVenue').value,
    date:        document.getElementById('eDate').value,
    time:        formattedTime,
    price_from:  parseInt(document.getElementById('ePriceFrom').value) || 0,
    price_to:    parseInt(document.getElementById('ePriceTo').value) || 0,
    language:    document.getElementById('eLang').value,
    age_limit:   document.getElementById('eAge').value,
    image:       document.getElementById('eImage').value,
    description: document.getElementById('eDesc').value
  };

  try {
    const token  = localStorage.getItem('token');
    const url    = id ? `${ADMIN_API}/events/${id}` : `${ADMIN_API}/events`;
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    closeModal('eventModal');
    await refreshEvents();
    alert(id ? 'Event updated!' : 'Event added!');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function refreshEvents() {
  try {
    const res  = await fetch(`${API}/events`);
    eventsData = await res.json();
    renderEvents();
    updateCounts();
  } catch (e) {}
}

// ── STREAMS TABLE ─────────────────────────────────────────────────────────
function renderStreams(data) {
  const list  = data || streamsData;
  const tbody = document.getElementById('streamsTable');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><i class="fa fa-play-circle" style="font-size:28px;display:block;margin-bottom:8px;color:#ddd"></i>No streams. Add one!</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr data-search="${s.title} ${s.language} ${s.genres}">
      <td><img class="thumb" src="${s.poster_image}" onerror="this.style.display='none'" alt=""></td>
      <td style="font-weight:600;max-width:200px">${s.title}</td>
      <td>${s.language || '—'}</td>
      <td>${s.release_date ? new Date(s.release_date).toLocaleDateString('en-IN') : '—'}</td>
      <td>₹${s.price_rent || 0}</td>
      <td>₹${s.price_buy || 0}</td>
      <td><span class="badge ${s.status === 'inactive' ? 'inactive' : 'active'}">${s.status || 'active'}</span></td>
      <td><div class="action-btns">
        <button class="btn-edit"   onclick="editStream(${s.id})"><i class="fa fa-edit"></i></button>
        <button class="btn-delete" onclick="confirmDelete('stream',${s.id},'${(s.title || '').replace(/'/g, "\\'")}')">
          <i class="fa fa-trash"></i>
        </button>
      </div></td>
    </tr>`).join('');
}

function editStream(id) {
  openStreamModal(streamsData.find(s => s.id === id));
}

// ── STREAM CRUD ────────────────────────────────────────────────────────────
function openStreamModal(st) {
  document.getElementById('editStreamId').value         = st?.id || '';
  document.getElementById('streamModalTitle').innerText = st ? 'Edit Stream' : 'Add Stream';
  document.getElementById('sTitle').value               = st?.title || '';
  document.getElementById('sGenres').value              = st?.genres || '';
  document.getElementById('sLang').value                = st?.language || '';
  document.getElementById('sRating').value              = st?.rating || '';
  document.getElementById('sDuration').value            = st?.duration || '';
  document.getElementById('sRent').value                = st?.price_rent || '';
  document.getElementById('sBuy').value                 = st?.price_buy || '';
  document.getElementById('sDate').value                = st?.release_date?.split('T')[0] || '';
  document.getElementById('sTrailer').value             = st?.trailer_url || '';
  document.getElementById('sPoster').value              = st?.poster_image || '';
  document.getElementById('sBanner').value              = st?.banner_image || '';
  document.getElementById('sDesc').value                = st?.description || '';

  const prevP = document.getElementById('sPosterPreview');
  if (st?.poster_image) { prevP.src = st.poster_image; prevP.style.display = 'block'; }
  else prevP.style.display = 'none';

  const prevB = document.getElementById('sBannerPreview');
  if (st?.banner_image) { prevB.src = st.banner_image; prevB.style.display = 'block'; }
  else prevB.style.display = 'none';

  document.getElementById('streamModal').classList.add('open');
}

async function saveStream() {
  const id    = document.getElementById('editStreamId').value;
  const title = document.getElementById('sTitle').value.trim();
  if (!title) { alert('Stream title is required.'); return; }

  const payload = {
    title,
    genres:       document.getElementById('sGenres').value,
    language:     document.getElementById('sLang').value,
    rating:       parseFloat(document.getElementById('sRating').value) || 0,
    duration:     parseInt(document.getElementById('sDuration').value) || 0,
    price_rent:   parseFloat(document.getElementById('sRent').value) || 0,
    price_buy:    parseFloat(document.getElementById('sBuy').value) || 0,
    release_date: document.getElementById('sDate').value || null,
    trailer_url:  document.getElementById('sTrailer').value,
    poster_image: document.getElementById('sPoster').value,
    banner_image: document.getElementById('sBanner').value,
    description:  document.getElementById('sDesc').value
  };

  try {
    const url    = id ? `${API}/stream/${id}` : `${API}/stream/add`;
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    closeModal('streamModal');
    await refreshStreams();
    alert(id ? 'Stream updated!' : 'Stream added!');
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function refreshStreams() {
  try {
    const res   = await fetch(`${API}/stream`);
    streamsData = await res.json();
    renderStreams();
    updateCounts();
  } catch (e) {}
}

// ── DELETE ────────────────────────────────────────────────────────────────
function confirmDelete(type, id, name) {
  deleteTarget = { type, id };
  document.getElementById('confirmMsg').innerHTML =
    `Are you sure you want to delete <b>"${name}"</b>? This cannot be undone.`;
  document.getElementById('confirmModal').classList.add('open');
}

async function doDelete() {
  if (!deleteTarget) return;
  try {
    const token = localStorage.getItem('token');
    const url   = deleteTarget.type === 'movie'
      ? `${ADMIN_API}/movies/${deleteTarget.id}`
      : deleteTarget.type === 'stream'
      ? `${API}/stream/${deleteTarget.id}`
      : `${ADMIN_API}/events/${deleteTarget.id}`;
    const res   = await fetch(url, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) throw new Error(await res.text());
    closeModal('confirmModal');
    if (deleteTarget.type === 'movie') await refreshMovies();
    else if (deleteTarget.type === 'stream') await refreshStreams();
    else await refreshEvents();
    deleteTarget = null;
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

// ── SEARCH TABLE ──────────────────────────────────────────────────────────
function searchTable(tbodyId, q) {
  document.querySelectorAll(`#${tbodyId} tr`).forEach(row => {
    const text = row.dataset.search || row.innerText;
    row.style.display = !q || text.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

// ── MODAL HELPERS ─────────────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function previewImg(input, previewId) {
  const prev = document.getElementById(previewId);
  if (input.value) { prev.src = input.value; prev.style.display = 'block'; }
  else prev.style.display = 'none';
}

// ── INIT ──────────────────────────────────────────────────────────────────
loadAll();