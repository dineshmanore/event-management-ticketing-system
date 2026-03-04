function goBack(fallback = 'index.html') {
    if (window.history.length > 1) {
        window.history.back();
        return;
    }
    window.location.href = fallback;
}

function bookEvent(eventName) {
    const isLoggedIn = localStorage.getItem('loggedIn');

    const modal = document.getElementById('bookingModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!modal || !title || !body) return;

    if (!isLoggedIn) {
        title.innerText = 'Login Required';
        body.innerHTML = `
            <p>Login or continue as guest to book <strong>${eventName}</strong>.</p>
            <button onclick="goToLogin()">Login</button>
            <button onclick="showGuestForm('${eventName}')">Continue as Guest</button>
            <button class="back-btn" onclick="closeModal()">Back</button>
        `;
        modal.style.display = 'flex';
        return;
    }

    title.innerText = '🎟 Ticket Booked';
    body.innerHTML = `
        <p>Your ticket for <strong>${eventName}</strong> has been booked successfully.</p>
        <button onclick="closeModal()">Close</button>
    `;
    modal.style.display = 'flex';
}

function goToLogin() {
    window.location.href = 'login.html';
}

function showGuestForm(eventName) {
    const body = document.getElementById('modalBody');
    if (!body) return;

    body.innerHTML = `
        <p>Fill details to book <strong>${eventName}</strong>.</p>
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Email" required>
        <input type="tel" placeholder="Mobile Number" required>
        <button onclick="confirmGuestBooking('${eventName}')">Confirm Booking</button>
        <button class="back-btn" onclick="showLoginOptions('${eventName}')">Back</button>
    `;
}

function showLoginOptions(eventName) {
    const body = document.getElementById('modalBody');
    if (!body) return;

    body.innerHTML = `
        <p>Choose how you want to continue for <strong>${eventName}</strong>.</p>
        <button onclick="goToLogin()">Login</button>
        <button onclick="showGuestForm('${eventName}')">Continue as Guest</button>
        <button class="back-btn" onclick="closeModal()">Back</button>
    `;
}

function confirmGuestBooking(eventName) {
    const body = document.getElementById('modalBody');
    const title = document.getElementById('modalTitle');
    if (!body || !title) return;

    const ticketId = 'BMS-' + Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString();

    title.innerText = '🎟 Your Ticket';
    body.innerHTML = `
        <div class="ticket-box">
            <h3>${eventName}</h3>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Status:</strong> Confirmed ✅</p>
            <div class="ticket-actions">
                <button onclick="window.print()">Print Ticket</button>
                <button onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
}

function loginUser() {
    localStorage.setItem('loggedIn', 'true');
    alert('Login successful!');
    window.location.href = 'events.html';
}

function logout() {
    localStorage.removeItem('loggedIn');
    alert('Logged out successfully');
    window.location.href = 'index.html';
}

document.getElementById('searchInput')?.addEventListener('keyup', function () {
    const value = this.value.toLowerCase();
    document.querySelectorAll('.event-card').forEach((card) => {
        card.style.display = card.innerText.toLowerCase().includes(value) ? 'block' : 'none';
    });
});

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'none';
}
