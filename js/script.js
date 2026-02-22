/* ===============================
   WELCOME
================================ */
function showWelcome() {
    alert("Welcome to Event Management & Ticketing System");
}

/* ===============================
   CONTACT FORM VALIDATION
================================ */
function validateContactForm() {
    const name = document.getElementById("name")?.value;
    const email = document.getElementById("email")?.value;
    const message = document.getElementById("message")?.value;

    if (!name || !email || !message) {
        alert("Please fill all fields");
        return false;
    }

    alert("Message sent successfully!");
    return true;
}

/* ===============================
   FOOTER YEAR
================================ */
document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
});

/* ===============================
   BUTTON PRESS ANIMATION
================================ */
document.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        e.target.style.transform = "scale(0.95)";
        setTimeout(() => {
            e.target.style.transform = "scale(1)";
        }, 150);
    }
});

/* ===============================
   LOGIN CHECKED BOOKING
================================ */
function bookEvent(eventName) {
    const isLoggedIn = localStorage.getItem("loggedIn");

    const modal = document.getElementById("bookingModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    if (!isLoggedIn) {
        title.innerText = "Login Required";
        body.innerHTML = `
            <p>You must login or continue as guest to book
            <strong>${eventName}</strong>.</p>

            <button onclick="goToLogin()">Login</button>
            <button onclick="showGuestForm('${eventName}')">
                Continue as Guest
            </button>
            <button class="back-btn" onclick="closeModal()">
                ← Back
            </button>
        `;

        modal.style.display = "flex";
        return;
    }

    title.innerText = "🎟 Ticket Booked";
    body.innerHTML = `
        <p>Your ticket for <strong>${eventName}</strong> is booked successfully.</p>
        <button onclick="closeModal()">Close</button>
    `;

    modal.style.display = "flex";
}

function goToLogin() {
    window.location.href = "login.html";
}

function showGuestForm(eventName) {
    const body = document.getElementById("modalBody");

    body.innerHTML = `
        <p>Fill details to book <strong>${eventName}</strong></p>

        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Email" required>
        <input type="tel" placeholder="Mobile Number" required>

        <button onclick="confirmGuestBooking('${eventName}')">
            Confirm Booking
        </button>

        <button class="back-btn" onclick="showLoginOptions('${eventName}')">
            ← Back
        </button>
    `;
}

function showLoginOptions(eventName) {
    const body = document.getElementById("modalBody");

    body.innerHTML = `
        <p>You must login or fill details to book <strong>${eventName}</strong>.</p>

        <button onclick="goToLogin()">Login</button>
        <button onclick="showGuestForm('${eventName}')">
            Continue as Guest
        </button>

        <button class="back-btn" onclick="closeModal()">
            ← Back
        </button>
    `;
}

function confirmGuestBooking(eventName) {
    const body = document.getElementById("modalBody");
    const title = document.getElementById("modalTitle");

    const ticketId = "EVT-" + Math.floor(Math.random() * 100000);
    const date = new Date().toLocaleDateString();

    title.innerText = "🎟 Your Ticket";

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

/* ===============================
   LOGIN FUNCTION
================================ */
function loginUser() {
    localStorage.setItem("loggedIn", "true");
    alert("Login successful!");
    window.location.href = "events.html";
}

/* ===============================
   LOGOUT
================================ */
function logout() {
    localStorage.removeItem("loggedIn");
    alert("Logged out successfully");
    window.location.href = "index.html";
}

/* ===============================
   SCROLL REVEAL
================================ */
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 80) {
            el.classList.add("active");
        }
    });
});

/* ===============================
   EVENT SEARCH FILTER
================================ */
document.getElementById("searchInput")?.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();

    document.querySelectorAll(".event-card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
});

function closeModal() {
    const modal = document.getElementById("bookingModal");
    if (modal) {
        modal.style.display = "none";
    }
}
