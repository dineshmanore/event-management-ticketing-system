const API_BASE = 'http://localhost:5000/api';

async function pay() {
  const movieId = localStorage.getItem('movieId');
  const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
  const token = localStorage.getItem('token');
  const totalPrice = parseInt(localStorage.getItem('totalPrice') || '0');
  const convFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + convFee;

  if (!token) {
    alert('Please sign in first.');
    window.location.href = 'login.html';
    return;
  }

  if (!movieId || seats.length === 0) {
    alert('Missing booking data. Please start over.');
    window.location.href = 'index.html';
    return;
  }

  try {
    // STEP 1: Create Razorpay order on backend
    const orderRes = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grandTotal })
    });
    const order = await orderRes.json();

    // STEP 2: Open Razorpay checkout
    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID',   // ← replace with your key
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
        const bookingRes = await fetch(`${API_BASE}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ movieId, seats })
        });
        const booking = await bookingRes.json();

        if (booking.success) {
          localStorage.removeItem('selectedSeats');
          localStorage.removeItem('totalPrice');
          alert('Booking Confirmed! Your tickets are ready.');
          window.location.href = 'dashboard.html';
        } else {
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
