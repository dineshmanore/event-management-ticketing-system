const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://event-management-ticketing-system.onrender.com/api';

async function pay() {
  const movieId = localStorage.getItem('movieId');
  const eventId = localStorage.getItem('eventId');
  const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
  const token = localStorage.getItem('token');
  const totalPrice = parseInt(localStorage.getItem('totalPrice') || '0');
  const convFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + convFee;
  const type = localStorage.getItem('bookingType');

  if (!token) {
    alert('Please sign in first.');
    window.location.href = 'login.html';
    return;
  }

  if (type === 'movie') {
  if (!movieId || seats.length === 0) {
    alert('Missing booking data. Please start over.');
    window.location.href = 'index.html';
    return;
  }
}

if (type === 'event') {
  if (!eventId) {
    alert('Missing event data.');
    window.location.href = 'index.html';
    return;
  }
}
  try {
    // STEP 1: Create Razorpay order on backend
    const orderRes = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grandTotal })
    });
    const order = await orderRes.json();
    
    console.log("ORDER:", order)

    // STEP 2: Open Razorpay checkout
    const options = {
      key: 'rzp_test_SV1Di4AUXyJL8e',   // ← replace with your key
      amount: order.amount,
      currency: 'INR',
      name: 'ShowTime',
      description: `Movie Booking — ${seats.length} seat(s)`,
      order_id: order.id,
      theme: { color: '#cc0c39' },

      handler: async function(response) {
        // STEP 3: Verify payment
        const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response)
        });
        const verified = await verifyRes.json();

        if (!verified.success) {
          alert('Payment verification failed. Contact support.');
          return;
        }

        // STEP 4: Save booking
        const bookingType = localStorage.getItem('bookingType') || 'movie';
        const finalId = bookingType === 'event' ? (eventId || movieId) : movieId;
        
        const bookingRes = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ 
            movieId: finalId, // Reusing movie_id column for any booking item ID 
            seats: seats.length ? seats : [`General x${localStorage.getItem('ticketCount') || 1}`],
            totalPrice: parseInt(localStorage.getItem('totalPrice') || '0'),
            date: localStorage.getItem('bookingDate') || new Date().toISOString().split('T')[0]
          })
        });
        const booking = await bookingRes.json();

        if (booking.success || booking.id || booking.bookingId) {
          localStorage.removeItem('selectedSeats');
          localStorage.removeItem('totalPrice');
          localStorage.removeItem('ticketCount');
          alert('Booking Confirmed! Your tickets are ready.');
          window.location.replace('dashboard.html');
        } else {
          console.error("Booking error:", booking);
          alert('Booking failed after payment. Please contact support.');
        }
      },

      prefill: { name: localStorage.getItem('userName') || '' },
      modal: { ondismiss: () => alert('Payment cancelled.') }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert('Payment error. Please try again.');
  }
}
