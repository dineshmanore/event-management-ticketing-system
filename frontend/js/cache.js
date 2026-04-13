// cache.js — shared API caching to speed up Sports, Activities, Events, Plays pages
// Stores data in sessionStorage so second visit to any category page is instant

var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch with sessionStorage cache.
 * On first call: fetches from network, caches result.
 * On subsequent calls within TTL: returns from cache instantly (no network request).
 */
async function cachedFetch(url) {
  var cacheKey = 'showtime_cache_' + url;
  try {
    var cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        return parsed.data;
      }
    }
  } catch(e) { /* ignore storage errors */ }

  // Not cached or expired — fetch fresh
  var res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var data = await res.json();

  // Store in cache
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: data }));
  } catch(e) { /* ignore storage quota errors */ }

  return data;
}

/**
 * Show skeleton loading cards while data loads
 */
function showSkeletons(containerId, count, type) {
  count = count || 6;
  var el = document.getElementById(containerId);
  if (!el) return;

  if (type === 'list') {
    // Horizontal list skeleton (for sports/plays)
    el.innerHTML = Array(count).fill(0).map(function() {
      return '<div style="background:white;border-radius:14px;overflow:hidden;border:1px solid #e8e8e8;animation:skeleton-pulse 1.5s ease-in-out infinite;">' +
        '<div style="height:200px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:skeleton-shimmer 1.5s infinite;"></div>' +
        '<div style="padding:14px;">' +
          '<div style="height:12px;background:#f0f0f0;border-radius:4px;width:40%;margin-bottom:10px;"></div>' +
          '<div style="height:16px;background:#f0f0f0;border-radius:4px;width:85%;margin-bottom:8px;"></div>' +
          '<div style="height:12px;background:#f0f0f0;border-radius:4px;width:60%;"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    // Grid skeleton (default)
    el.innerHTML = Array(count).fill(0).map(function() {
      return '<div style="background:white;border-radius:14px;overflow:hidden;border:1px solid #e8e8e8;">' +
        '<div style="height:240px;background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:skeleton-shimmer 1.5s infinite;"></div>' +
        '<div style="padding:14px;">' +
          '<div style="height:11px;background:#f0f0f0;border-radius:4px;width:35%;margin-bottom:10px;"></div>' +
          '<div style="height:15px;background:#f0f0f0;border-radius:4px;width:90%;margin-bottom:8px;"></div>' +
          '<div style="height:11px;background:#f0f0f0;border-radius:4px;width:55%;"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}
