function formatVotes(votes) {
  if (!votes) return '0 votes';
  if (votes >= 1000000) return (votes / 1000000).toFixed(1) + 'M+ votes';
  if (votes >= 1000) return (votes / 1000).toFixed(1) + 'K+ votes';
  return votes + ' votes';
}

function createMovieCard(movie) {
  const ratingPercent = Math.round((movie.rating / 10) * 100);
  const type = movie.type || 'movie';
  return `
    <div class="card" onclick="openItem('${movie.id}', '${type}')">
      <div class="poster">
        <img src="${movie.poster || movie.image || 'https://via.placeholder.com/300x450'}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/170x250/cc0c39/white?text=No+Image'">
        ${movie.rating > 0 ? `
          <div class="liked-badge"><i class="fa fa-thumbs-up" style="font-size:10px;margin-right:3px"></i>${ratingPercent}%</div>
          <div class="rating-bar">
            <span class="rating-score"><i class="fa fa-star"></i>${movie.rating}/10</span>
            <span style="opacity:0.8">${formatVotes(movie.votes)}</span>
          </div>
          <div class="vote-bar-wrap">
            <div class="vote-bar-fill" style="width:${ratingPercent}%"></div>
          </div>
        ` : ''}
      </div>
      <div class="movie-title">${movie.title}</div>
      <div class="movie-genre">${movie.genre || movie.genres || ''}</div>
    </div>`;
}

function openItem(id, type) {
  const url = type === 'stream' 
    ? `stream-detail.html?id=${encodeURIComponent(id)}` 
    : `movie.html?id=${encodeURIComponent(id)}`;
  
  if (type !== 'stream' && id) {
    localStorage.setItem('movieId', id);
  }

  if (window.spaNavigate) {
    window.spaNavigate(url);
  } else {
    window.location.href = url;
  }
}

// Legacy support
function openMovie(id) {
  openItem(id, 'movie');
}