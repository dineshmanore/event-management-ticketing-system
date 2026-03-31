// seats.js — real seat booking with DB integration
const API = 'https://event-management-ticketing-system.onrender.com/api';

const tierPrices = { recliner: 500, gold: 350, silver: 200 };
const tiers = [
  { id: 'reclinerGrid', name: 'recliner', rows: ['A', 'B'],             cols: 8  },
  { id: 'goldGrid',     name: 'gold',     rows: ['C', 'D', 'E'],        cols: 10 },
  { id: 'silverGrid',   name: 'silver',   rows: ['F', 'G', 'H', 'I'],  cols: 10 },
];

let selectedSeats   = [];
let bookedSeatsDB   = [];

// FIX #1: Read movieId from URL param FIRST, then fall back to localStorage.
// Previously only localStorage was checked, so clicking a movie card (which
// navigates via openMovie() without saving to localStorage in the old code)
// would leave movieId as null and cause an immediate redirect to home.
// Now api.js's openMovie() saves to localStorage, AND we read URL as a backup.
const urlId = new URLSearchParams(window.location.search).get('id');
const movieId = urlId || localStorage.getItem('movieId');

if (!movieId || movieId === 'null' || movieId === 'undefined') {
  alert('No movie selected. Redirecting to home.');
  window.location.href = 'index.html';
} else {
  // Keep localStorage in sync with the URL param
  localStorage.setItem('movieId', movieId);
}

async function loadMovieTitle() {
  try {
    const res = await fetch(`${API}/movies/${movieId}`);
    const movie = await res.json();
    if (movie && movie.title) {
      document.getElementById('seatsMovieTitle').innerText = movie.title;
      document.title = `Seats — ${movie.title}`;
    }
  } catch (e) {
    document.getElementById('seatsMovieTitle').innerText = 'Select Seats';
  }
}

// Dynamically set theater location based on User's City selection
const userCity = localStorage.getItem('city') || 'Mumbai';
const locEl = document.getElementById('theaterLocation');
if (locEl) {
  locEl.innerHTML = `<i class="fa fa-map-marker-alt" style="color:#cc0c39;margin-right:6px"></i> PVR Cinemas, ${userCity}`;
}

// Track selected date
let selectedDate = '';

function buildDateStrip() {
  const strip  = document.getElementById('dateStrip');
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today  = new Date();
  
  // Set default selectedDate to today
  selectedDate = today.toISOString().split('T')[0];

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()];
    
    html += `<div class="date-pill ${i === 0 ? 'active' : ''}" data-date="${dateStr}" onclick="selectDate(this)">
               <div class="day">${label}</div>
               <div class="month">${d.getDate()} ${months[d.getMonth()]}</div>
             </div>`;
  }
  strip.innerHTML = html;
}

function selectDate(el) {
  document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedDate = el.dataset.date;
  
  // Reset selected seats when date changes
  selectedSeats = [];
  updateStickyBar();
  loadBookedSeats();
}

async function loadBookedSeats() {
  try {
    const res = await fetch(`${API}/bookings/seats/${movieId}?date=${selectedDate}`);
    if (!res.ok) throw new Error('Failed');
    bookedSeatsDB = await res.json();
  } catch (e) {
    console.warn('Could not fetch booked seats, showing all as available.');
    bookedSeatsDB = [];
  }
  buildSeats();
}

function buildSeats() {
  tiers.forEach(tier => {
    const grid = document.getElementById(tier.id);
    if (!grid) return;
    let html = '';
    tier.rows.forEach(row => {
      const half = Math.floor(tier.cols / 2);
      html += '<div class="seat-row">';
      html += `<span class="row-label">${row}</span>`;
      for (let i = 1; i <= tier.cols; i++) {
        if (i === half + 1) html += '<div class="gap"></div>';
        const seatId  = `${row}${i}`;
        const booked  = bookedSeatsDB.includes(seatId);
        const cls     = booked ? 'booked' : 'available';
        const handler = booked ? 'disabled' : `onclick="toggleSeat(this)"`;
        html += `<button class="seat ${cls}"
                         data-seat="${seatId}"
                         data-tier="${tier.name}"
                         data-price="${tierPrices[tier.name]}"
                         ${handler}>${i}</button>`;
      }
      html += '</div>';
    });
    grid.innerHTML = html;
  });
}

function toggleSeat(btn) {
  const seatId = btn.dataset.seat;
  const price  = parseInt(btn.dataset.price);
  if (btn.classList.contains('selected')) {
    btn.classList.replace('selected', 'available');
    selectedSeats = selectedSeats.filter(s => s.id !== seatId);
  } else {
    if (selectedSeats.length >= 10) {
      alert('Maximum 10 seats per booking.');
      return;
    }
    btn.classList.replace('available', 'selected');
    selectedSeats.push({ id: seatId, price });
  }
  updateStickyBar();
}

function updateStickyBar() {
  const bar   = document.getElementById('stickyBar');
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  if (selectedSeats.length === 0) {
    bar.classList.add('hidden');
  } else {
    bar.classList.remove('hidden');
    document.getElementById('stickyTickets').innerText =
      `${selectedSeats.length} Ticket${selectedSeats.length > 1 ? 's' : ''}`;
    document.getElementById('stickyPrice').innerText = `Total: ₹${total}`;
  }
}

async function confirmSeats() {
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat.');
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please sign in to book tickets.');
    window.location.href = 'login.html';
    return;
  }

  const seatIds    = selectedSeats.map(s => s.id);
  const totalPrice = selectedSeats.reduce((s, x) => s + x.price, 0);

  try {
    const checkRes = await fetch(`${API}/bookings/seats/${movieId}?date=${selectedDate}`);
    const latestBooked = await checkRes.json();
    const conflict = seatIds.some(s => latestBooked.includes(s));
    if (conflict) {
      alert('One or more selected seats were just booked by someone else. Please reselect.');
      bookedSeatsDB = latestBooked;
      selectedSeats = [];
      buildSeats();
      updateStickyBar();
      return;
    }
  } catch (e) { /* proceed anyway */ }

  // Bypass premature DB insertion to prevent locking.
  // Save selections to local storage and forward to payment process.
  localStorage.setItem('selectedSeats', JSON.stringify(seatIds));
  localStorage.setItem('totalPrice',    totalPrice);
  localStorage.setItem('bookingDate',   selectedDate || new Date().toISOString().split('T')[0]);
  localStorage.setItem('bookingType',   'movie'); // Distinguish between movies and events
  
  window.location.href = `payment.html?id=${movieId}`;
}

loadMovieTitle();
buildDateStrip();
loadBookedSeats();