function formatVotes(votes) {
  if (votes >= 1000000) return (votes / 1000000).toFixed(1) + 'M+';
  if (votes >= 1000) return (votes / 1000).toFixed(1) + 'K+';
  return votes;
}

function createMovieCard(movie) {
  const ratingPercent = Math.round((movie.rating / 10) * 100);
  return `
    <div class="card" onclick="openMovie(${movie.id})">
      <div class="poster">
        <img src="${movie.poster || movie.image || 'https://via.placeholder.com/300x450'}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/170x250/cc0c39/white?text=No+Image'">
        <div class="liked-badge"><i class="fa fa-thumbs-up" style="font-size:10px;margin-right:3px"></i>${ratingPercent}%</div>
        <div class="rating-bar">
          <span class="rating-score"><i class="fa fa-star"></i>${movie.rating}/10</span>
          <span style="opacity:0.8">${formatVotes(movie.votes)}</span>
        </div>
        <div class="vote-bar-wrap">
          <div class="vote-bar-fill" style="width:${ratingPercent}%"></div>
        </div>
      </div>
      <div class="movie-title">${movie.title}</div>
      <div class="movie-genre">${movie.genre || ''}</div>
    </div>`;
}

function openMovie(id) {
  window.location.href = `movie.html?id=${id}`;
}