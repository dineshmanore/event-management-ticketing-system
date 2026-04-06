# 📄 Final Project Report: ShowTime

## **1. Project Overview**
**ShowTime** is a robust, end-to-end Event Management and Ticketing System designed to provide a premium user experience for booking movies, concerts, and live performances. The project leverages a modern Full-Stack MERN-style architecture (Node.js, Express, MongoDB) for the backend and a high-performance Vanilla JavaScript frontend for the client.

## **2. Problem Statement**
Current ticketing platforms often suffer from cluttered interfaces and slow performance. **ShowTime** aims to simplify the entertainment booking process through:
- An intuitive, interactive seat selection system.
- Secure, lightning-fast payment processing.
- A centralized Admin Dashboard for vendor management.

## **3. Features & Functionality**
- **Seat Mapping Engine:** Interactive theater-style seating grids with real-time availability.
- **Role-Based Access Control (RBAC):** Separate interfaces for Standard Users (booking) and Admins (inventory management).
- **Secure Authentication:** JWT-based login with Google OAuth integration for friction-less sign-in.
- **Dynamic Content:** Movies, events, and live streams are fetched in real-time from a cloud-hosted MongoDB Atlas database.
- **Payment Gateway:** Secure transactions via **Razorpay** with automated booking confirmations.

## **4. Technical Stack**
- **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JavaScript, FontAwesome.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (NoSQL).
- **Authentication:** JWT, bcryptjs, Google OAuth.
- **Payments:** Razorpay API.
- **Deployment:** Vercel (Frontend), Render (Backend).

## **5. Database Schema & Architecture**
The project utilizes several interlinked MongoDB collections:
- **Users:** Authentication and profile data.
- **Movies:** Showtimes, posters, cast details, and ratings.
- **Orders:** Transactional history linking users to movies/events.
- **Streams:** Specialized schema for virtual event links and access.

## **6. Git Workflow**
The development process followed strict version control practices:
- **Feature Brushing:** Major UI and API modules were developed iteratively.
- **Atomic Commits:** Each commit represents a meaningful piece of work (e.g., "Add seat selection logic").
- **Version Tracking:** Consistent commit history demonstrates the evolution of the codebase from MVP to Production.

## **7. Individual Contributions**
*Note: This project was a collaborative effort focusing on end-to-end integration.*
- **Backend Architecture:** Developing RESTful routes for orders and authentication.
- **Frontend Design:** Implementing the glassmorphic UI and responsive grids.
- **Integration:** Connecting Razorpay and Google Sign-In workflows.

## **8. Conclusion & Future Scope**
ShowTime successfully delivers a modern ticketing platform. Future enhancements include:
- **AI-Powered Recommendation Engine:** Suggesting movies based on user history.
- **QR Code Ticket Scanning:** Mobile-app integration for physical entry verification.
- **Real-time Notifications:** Webhooks for booking alerts and reminder notifications.

---
**Date of Submission:** 13/04/2026
**Group Members:** [Admin/User Name]
