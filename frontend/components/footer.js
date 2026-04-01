document.addEventListener('DOMContentLoaded', () => {
  const footerEl = document.getElementById('footer');
  if (footerEl) {
    footerEl.innerHTML = `
<footer class="footer">
  <div class="footer-container">
    <div class="footer-col">
      <div class="footer-logo" style="display:flex;align-items:center;gap:10px;margin-bottom:15px">
        <div class="logo-box" style="background:#cc0c39;color:white;padding:7px 11px;border-radius:6px;font-size:13px;font-weight:700">ST</div>
        <span style="color:white;font-size:18px;font-weight:700">ShowTime</span>
      </div>
      <p style="color:#a0a0a0;font-size:14px;line-height:1.6;margin-bottom:20px">Your one-stop destination for booking movies, events, plays, sports, and activities across India.</p>
      
      <div class="social-icons" style="display:flex;gap:15px">
        <a href="https://x.com/dinesh_manore" target="_blank" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-twitter"></i></a>
        <a href="https://in.pinterest.com/manoredinesh66" target="_blank" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-pinterest-p"></i></a>
        <a href="https://www.instagram.com/dinesh._.44" target="_blank" style="color:#d0d0d0;font-size:18px;transition:color 0.2s" onmouseover="this.style.color='white'" onmouseout="this.style.color='#d0d0d0'"><i class="fab fa-instagram"></i></a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Movies & More</h4>
      <ul>
        <li><a href="index.html">Now Showing</a></li>
        <li><a href="index.html">Coming Soon</a></li>
        <li><a href="events.html">Events</a></li>
        <li><a href="plays.html">Plays</a></li>
        <li><a href="sports.html">Sports</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Help & Support</h4>
      <ul>
        <li><a href="about.html">About Us</a></li>
        <li><a href="mailto:dineshmanore@gmail.com">Contact Us</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="terms.html">Terms & Conditions</a></li>
        <li><a href="privacy.html">Privacy Policy</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Contact</h4>
      <p style="margin-bottom:8px"><i class="fa fa-envelope" style="margin-right:8px;color:#cc0c39"></i><a href="mailto:dineshmanore6@gmail.com" style="color:inherit;text-decoration:none;">support@showtime.com</a></p>
      <p style="margin-bottom:8px"><i class="fa fa-phone" style="margin-right:8px;color:#cc0c39"></i><a href="tel:18001234567" style="color:inherit;text-decoration:none;">1800-123-4567</a></p>
      <p><i class="fa fa-map-marker-alt" style="margin-right:8px;color:#cc0c39"></i><a href="https://maps.google.com/?q=Mumbai,India" target="_blank" style="color:inherit;text-decoration:none;">Mumbai, India</a></p>
    </div>
  </div>

  <div class="footer-bottom">
    © 2026 ShowTime. All rights reserved. Made with ❤️ in India.
  </div>
</footer>
`;
  }

  // Global Custom Dropdown Injector for Category Pages
  const nativeSelects = document.querySelectorAll('.city-banner select, .search-row select');
  if(nativeSelects.length) {
    // Only inject CSS once
    const style = document.createElement('style');
    style.innerHTML = `
      .premium-dd { position: relative; min-width: 160px; font-family: 'Poppins', sans-serif; user-select: none; z-index: 100; margin-left: 16px; }
      .pd-selected { padding: 9px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; color: #fff; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: space-between; cursor: pointer; backdrop-filter: blur(8px); transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .search-row .pd-selected { color: #333; border-color: #ddd; background: #fff; box-shadow: none; font-weight: 400; padding: 10px 14px; }
      .pd-selected:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); }
      .search-row .pd-selected:hover { background: #f9f9f9; border-color: #cc0c39; }
      .premium-dd.open .pd-selected { border-color: #cc0c39; box-shadow: 0 0 0 3px rgba(204,12,57,0.2); }
      .pd-list { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transform: translateY(-8px); transition: 0.2s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; max-height: 300px; overflow-y: auto; }
      .search-row .pd-list { background: #fff; border-color: #eee; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      .premium-dd.open .pd-list { opacity: 1; visibility: visible; transform: translateY(0); }
      .pd-item { padding: 10px 16px; font-size: 13px; color: #d1d5db; cursor: pointer; transition: 0.15s; }
      .search-row .pd-item { color: #444; }
      .pd-item:hover { background: rgba(204,12,57,0.15); color: #fff; }
      .search-row .pd-item:hover { background: #fff0f3; color: #cc0c39; }
    `;
    document.head.appendChild(style);

    nativeSelects.forEach(sel => {
      sel.style.display = 'none';
      const wrap = document.createElement('div');
      wrap.className = 'premium-dd';
      
      const selected = document.createElement('div');
      selected.className = 'pd-selected';
      // Match icon based on context
      const isCity = sel.innerHTML.includes('Mumbai') || sel.innerHTML.includes('Cities');
      const iconHTML = isCity && !sel.closest('.search-row') ? '<i class="fa fa-map-marker-alt" style="margin-right:8px;color:#cc0c39"></i>' : '';
      selected.innerHTML = `${iconHTML}<span>${sel.options[sel.selectedIndex].text}</span><i class="fa fa-chevron-down" style="margin-left:12px;opacity:0.6;font-size:10px"></i>`;
      
      const list = document.createElement('div');
      list.className = 'pd-list';
      
      Array.from(sel.options).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'pd-item';
        item.innerText = opt.text;
        item.onclick = (e) => {
          e.stopPropagation();
          sel.value = opt.value;
          selected.querySelector('span').innerText = opt.text;
          wrap.classList.remove('open');
          sel.dispatchEvent(new Event('change'));
        };
        list.appendChild(item);
      });
      
      selected.onclick = (e) => { 
        e.stopPropagation(); 
        document.querySelectorAll('.premium-dd.open').forEach(d => { if(d !== wrap) d.classList.remove('open') });
        wrap.classList.toggle('open'); 
      };
      document.addEventListener('click', () => wrap.classList.remove('open'));
      
      wrap.appendChild(selected);
      wrap.appendChild(list);
      sel.parentNode.insertBefore(wrap, sel);
    });
  }
});
