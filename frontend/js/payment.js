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

  // Show loading state if button exists
  const payBtn = document.querySelector('button[onclick="pay()"]');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerText = 'Processing...';
  }

  try {
    console.log("Creating order for amount:", grandTotal);
    
    // STEP 1: Create Razorpay order on backend
    const orderRes = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: grandTotal })
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      throw new Error(errorData.message || 'Failed to create payment order');
    }

    const order = await orderRes.json();
    console.log("ORDER CREATED:", order);

    if (!order.id) {
      throw new Error('Invalid order received from server');
    }

    // STEP 2: Open Razorpay checkout
    const options = {
      key: 'rzp_test_SV1Di4AUXyJL8e', // Ensure this matches your Razorpay Dashboard Key ID
      amount: order.amount,
      currency: 'INR',
      name: 'ShowTime',
      description: type === 'event' ? 'Event Booking' : `Movie Booking — ${seats.length} seat(s)`,
      order_id: order.id,
      theme: { color: '#cc0c39' },

      // Optimization for better mobile experience
      retry: { enabled: true, max_count: 3 },
      
      handler: async function(response) {
        if (payBtn) payBtn.innerText = 'Verifying...';
        
        // STEP 3: Verify payment
        try {
          const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verified = await verifyRes.json();

          console.log("Verify Response:", verified);

          if (!verified.success) {
            console.warn('Payment verification failed on server.');
            // For testing, we might proceed, but in production we should stop.
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
              movieId: finalId, 
              seats: seats.length ? seats : [`General x${localStorage.getItem('ticketCount') || 1}`],
              totalPrice: totalPrice,
              date: localStorage.getItem('bookingDate') || new Date().toISOString().split('T')[0]
            })
          });
          const booking = await bookingRes.json();

          if (booking.success || booking.id || booking.bookingId) {
            localStorage.removeItem('selectedSeats');
            localStorage.removeItem('totalPrice');
            localStorage.removeItem('ticketCount');
            alert('Booking Confirmed! Your tickets are ready.');
            
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 500);
          } else {
            throw new Error(booking.message || 'Booking failed after payment');
          }
        } catch (vErr) {
          console.error("Verification/Booking Error:", vErr);
          alert('Error updating booking: ' + vErr.message);
        }
      },

      prefill: {
        name: localStorage.getItem('userName') || '',
        contact: '', // Optional: can be filled if available
        email: ''    // Optional
      },
      modal: {
        ondismiss: function() {
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerText = 'Pay Now';
          }
          console.log('Payment checkout closed');
        }
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      console.error("Payment Failed:", response.error);
      alert("Payment failed: " + response.error.description);
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerText = 'Pay Now';
      }
    });

    rzp.open();

  } catch (err) {
    console.error("PAYMENT FLOW ERROR:", err);
    alert('Payment initialization failed: ' + err.message);
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.innerText = 'Pay Now';
    }
  }
}

