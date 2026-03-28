CREATE DATABASE IF NOT EXISTS showtime;
USE showtime;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  genre       VARCHAR(100),
  language    VARCHAR(100),
  rating      FLOAT DEFAULT 0,
  votes       INT DEFAULT 0,
  poster      TEXT,
  banner      TEXT,
  description TEXT,
  category    VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS bookings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  movie_id     INT NOT NULL,
  seats        VARCHAR(500),
  total_price  FLOAT DEFAULT 0,
  booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  booking_id     INT,
  payment_method VARCHAR(50),
  status         VARCHAR(50) DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE actors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  image VARCHAR(500)
);

CREATE TABLE movie_cast (
  movie_id INT,
  actor_id INT,
  role VARCHAR(255)
);

-- TMDB images (open CDN, no hotlinking block)
INSERT INTO movies (title, genre, language, rating, votes, poster, banner, description, category) VALUES

('KGF Chapter 2',
 'Action',
 'Hindi',
 8.4, 245000,
 'https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg',
 'https://image.tmdb.org/t/p/original/5e2DqBiGgkH1S5t7AxFexfkgIHQ.jpg',
 'Rocky rises to power as enemies close in. The most explosive chapter of the KGF saga continues.',
 'Movies'),

('Animal',
 'Action, Drama',
 'Hindi',
 7.6, 182000,
 'https://image.tmdb.org/t/p/w500/4h4MgMpqJAibGrUL8yvhRtFUJr.jpg',
 'https://image.tmdb.org/t/p/original/wLFBCpIqTjBVOTTjLkOdBGkSsCY.jpg',
 'A son obsessed with his father. A family torn apart by power. Ranbir Kapoor in a career-defining role.',
 'Movies'),

('Jawan',
 'Action, Thriller',
 'Hindi',
 7.1, 165000,
 'https://image.tmdb.org/t/p/w500/oEB0XLSZ8GEfBbk5SBLQimh41Oy.jpg',
 'https://image.tmdb.org/t/p/original/sV9sUbnlOyqhJ7DX5MTOM28hxvZ.jpg',
 'A man is driven by a personal vendetta to rectify the wrongs in society while keeping a promise made years ago.',
 'Movies'),

('Pathaan',
 'Action, Spy',
 'Hindi',
 5.7, 210000,
 'https://image.tmdb.org/t/p/w500/p3bH5PHKQ9Cs2mRnBW9cBrZvMRA.jpg',
 'https://image.tmdb.org/t/p/original/wDWwtvkekn28kznP24cvPJ0lDCC.jpg',
 'An Indian spy takes on the head of a mercenary organization out to destabilize India.',
 'Movies'),

('12th Fail',
 'Drama',
 'Hindi',
 9.0, 95000,
 'https://image.tmdb.org/t/p/w500/9nuGBH5SGWT5LwFcIBMcjE6pjsf.jpg',
 'https://image.tmdb.org/t/p/original/pGjCEBGBMZI3dqWR8jfasxqVxLj.jpg',
 'The inspiring true story of Manoj Kumar Sharma who cracked the UPSC against all odds to become an IPS officer.',
 'Movies'),

('Leo',
 'Action, Thriller',
 'Tamil',
 6.5, 140000,
 'https://image.tmdb.org/t/p/w500/rOvZnb5FjGFt4MqRNMJmEoXjpj.jpg',
 'https://image.tmdb.org/t/p/original/mRmRE4RknbL7qKALWQDz7hXkZpQ.jpg',
 'A mild-mannered cafe owner is pushed to his limits when a dangerous gang disrupts his peaceful life.',
 'Movies'),

('Dunki',
 'Comedy, Drama',
 'Hindi',
 5.9, 88000,
 'https://image.tmdb.org/t/p/w500/lA5fyBGhSwZKBScEwGFDOkf1WfE.jpg',
 'https://image.tmdb.org/t/p/original/4mzDqZNhO1CWsxF8j8bLSLi0SvJ.jpg',
 'A group of friends use the illegal Donkey Flight route to fulfil their dreams of living abroad.',
 'Movies'),

('Rocky Aur Rani Kii Prem Kahaani',
 'Romance, Comedy',
 'Hindi',
 6.5, 76000,
 'https://image.tmdb.org/t/p/w500/qiZ5Z5bLi8F4F3z7aAB3zNZmhEY.jpg',
 'https://image.tmdb.org/t/p/original/tV7dFh7OYdrsSN1lFq07M3nCtyB.jpg',
 'Rocky, a loud Punjabi boy, and Rani, a sophisticated Bengali girl fall in love across cultural divides.',
 'Movies'),

('Salaar',
 'Action',
 'Telugu',
 6.4, 132000,
 'https://image.tmdb.org/t/p/w500/9ZoQC2PFuAKm1fPQFZFZGiqTFcA.jpg',
 'https://image.tmdb.org/t/p/original/uEkpGBSEMEFXO2V7kFCl5IQvCL.jpg',
 'A ferocious warrior embarks on a deadly mission in a treacherous kingdom to keep a promise to his friend.',
 'Movies'),

('Tiger 3',
 'Action, Spy',
 'Hindi',
 5.5, 118000,
 'https://image.tmdb.org/t/p/w500/bBlbig1O9BMGM5JKRM8c4aSBgMt.jpg',
 'https://image.tmdb.org/t/p/original/d4fwW8W2RIWFv2Zt7D1oJGPEWfZ.jpg',
 'India''s deadliest RAW agent faces a rogue ex-spy who targets his family for revenge.',
 'Movies'),

('Kalki 2898 AD',
 'Sci-Fi, Action',
 'Telugu',
 7.3, 195000,
 'https://image.tmdb.org/t/p/w500/kHPJEP3UzEF2RxHMJSKxP9M8a6H.jpg',
 'https://image.tmdb.org/t/p/original/1PBuEPPGxqEJzSNJiuGnJFJRBN4.jpg',
 'Set in a dystopian future, a warrior is destined to be born as the final avatar to defeat eternal evil.',
 'Movies'),

('Stree 2',
 'Horror, Comedy',
 'Hindi',
 7.8, 220000,
 'https://image.tmdb.org/t/p/w500/n3sEmEUc5nUm1EkSR8DXHFIVMb5.jpg',
 'https://image.tmdb.org/t/p/original/oW0tIVSfh6ZJMG8LJGZ0XYWK0eB.jpg',
 'The town of Chanderi faces a new supernatural terror. The gang must once again unite to fight the unknown.',
 'Movies');
