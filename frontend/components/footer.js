document.getElementById('footer').innerHTML = `
<footer class="footer">
  <div class="footer-container">
    <div class="footer-col">
      <div class="footer-logo" style="display:flex;align-items:center;gap:10px;margin-bottom:15px">
        <div class="logo-box" style="background:#cc0c39;color:white;padding:7px 11px;border-radius:6px;font-size:13px;font-weight:700">ST</div>
        <span style="color:white;font-size:18px;font-weight:700">ShowTime</span>
      </div>
      <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin-bottom:20px">Your one-stop destination for booking movies, events, plays, sports, and activities across India.</p>
      
      <div class="social-icons" style="display:flex;gap:15px">
        <a href="#" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-twitter"></i></a>
        <a href="#" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-pinterest-p"></i></a>
        <a href="#" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-instagram"></i></a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Movies & More</h4>
      <ul>
        <li><a href="#">Now Showing</a></li>
        <li><a href="#">Coming Soon</a></li>
        <li><a href="#">Events</a></li>
        <li><a href="#">Plays</a></li>
        <li><a href="#">Sports</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Help & Support</h4>
      <ul>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Terms & Conditions</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Contact</h4>
      <p style="margin-bottom:8px"><i class="fa fa-envelope" style="margin-right:8px;color:#cc0c39"></i>support@showtime.com</p>
      <p style="margin-bottom:8px"><i class="fa fa-phone" style="margin-right:8px;color:#cc0c39"></i>1800-123-4567</p>
      <p><i class="fa fa-map-marker-alt" style="margin-right:8px;color:#cc0c39"></i>Mumbai, India</p>
    </div>
  </div>

  <div class="footer-bottom">
    © 2024 ShowTime. All rights reserved. Made with ❤️ in India.
  </div>
</footer>`;
