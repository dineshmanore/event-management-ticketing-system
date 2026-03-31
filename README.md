# 🎬 ShowTime: Event Management & Ticketing System

**ShowTime** is a full-stack, comprehensive web application designed for booking movies, live streams, concerts, sporting events, and theater plays. It was built as a modern, premium entertainment platform featuring real-time seat selection, integrated payment gateways, and a fully robust Admin Dashboard to manage inventory.

## 🚀 Live Demo
- **Frontend Dashboard:** [https://event-management-ticketing-system-seven.vercel.app](https://event-management-ticketing-system-seven.vercel.app)
- **Backend API:** Hosted on Render

---

## ✨ Key Features

### 👤 User Experience
- **Dynamic Content Discovery:** Easily browse and filter "Now Showing", "Recommended", and "Premiere" movies, or explore specific events (Concerts, Workshops, Exhibitions) across specific cities like Pune and Mumbai.
- **Seat Mapping & Booking:** Interactive visual seat selection grid for movie theaters.
- **Secure Authentication:** User login and registration powered by JWT, plus seamless **Google Sign-In** integration.
- **Payment Processing:** Fully integrated with **Razorpay** to process secure ticket purchases.
- **Responsive UI:** A premium, "glassmorphism" inspired dark-mode UI optimized for both desktop and mobile devices.

### 🛡️ Admin Dashboard
- **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capability for Movies, Streams, and Events.
- **Metrics Overview:** Quickly view total users, total bookings, total revenue, and available capacity.
- **Cast & Crew System:** Add dynamic cast members to specific movies.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **HTML5 & CSS3:** Modern, semantic layout with custom CSS variables, flexbox, grid, and fluid animations.
- **Vanilla JavaScript:** High-performance DOM manipulation and component rendering without heavy frameworks.
- **FontAwesome:** Scalable vector icons.

### Backend (Server-Side)
- **Node.js & Express.js:** Fast, asynchronous REST API architecture handling routing, middleware, and business logic.
- **MongoDB Atlas & Mongoose:** NoSQL cloud database configured with robust data schemas for Movies, Users, Streams, Events, and Bookings.
- **Security & Utilities:** `bcryptjs` for password hashing, `cors`, `dotenv` for environment management, and `jsonwebtoken` for stateless auth sessions.

---

## ⚙️ Local Setup & Installation

If you'd like to run this application on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/event-management-ticketing-system.git
cd event-management-ticketing-system
```

### 2. Backend Setup
Navigate into the backend directory and install the necessary dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the root of the `backend` folder and add the following keys:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:5000
```

### 3. Frontend Setup
Because the frontend is built entirely with HTML/Vanilla JS, no build step (`npm run build`) is required!

1. Open `frontend/js/config.js` or wherever the `API` constant is defined.
2. Ensure the API points to your local server: `const API = 'http://localhost:5000/api';`
3. Launch `frontend/index.html` using a local static server like VS Code's **Live Server** extension.

---

## ☁️ Deployment

- **Frontend:** Deployed via **Vercel** configured with `cleanUrls: true` for elegant routing without `.html` extensions.
- **Backend:** Hosted continuously on **Render.com**. 

---

## 🎓 Academic / Portfolio Note
This project demonstrates end-to-end web development principles, including:
- RESTful API design
- Relational data linking (referencing MongoDB ObjectIds)
- Role-based Access Control (Admin vs. Standard User)
- Third-party API integration (OAuth & Payment Gateways)
- Responsive, accessible Web Design

---

*Made with passion to bridge the gap between people and world-class entertainment.*
