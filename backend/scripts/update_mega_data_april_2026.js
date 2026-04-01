const mongoose = require('mongoose');
const Movie = require('../models/Movie.mongo');
const Event = require('../models/Event.mongo');
const Actor = require('../models/Actor.mongo');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/showtime';

async function seed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  // --- ACTORS SEEDING ---
  const actorNames = [
    { name: 'Ranveer Singh', image: 'https://image.tmdb.org/t/p/w500/869V7ZibHeXz9pYjQiRzU6op9vX.jpg' },
    { name: 'Sanjay Dutt', image: 'https://image.tmdb.org/t/p/w500/8tY6fWd7zY0kUv1YvV4sYm8m8D9.jpg' },
    { name: 'Arjun Rampal', image: 'https://image.tmdb.org/t/p/w500/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg' },
    { name: 'Salman Khan', image: 'https://image.tmdb.org/t/p/w500/5mGvM8D8mHqB1uQX6z6z8n7Y7r.jpg' },
    { name: 'Hrithik Roshan', image: 'https://image.tmdb.org/t/p/w500/5v6p4Z79FmHqGvS6nL1u_g3u8i4.jpg' },
    { name: 'Jr NTR', image: 'https://image.tmdb.org/t/p/w500/8A7YyV7eM8YyYgG1mPZ8S0T9YwQ.jpg' },
    { name: 'Akshay Kumar', image: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg' },
    { name: 'Alia Bhatt', image: 'https://image.tmdb.org/t/p/w500/3mGvM8D8mHqB1uQX6z6z8n7Y7r.jpg' },
    { name: 'Ranbir Kapoor', image: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg' },
    { name: 'Yash', image: 'https://image.tmdb.org/t/p/w500/8A7YyV7eM8YyYgG1mPZ8S0T9YwQ.jpg' },
    { name: 'Sai Pallavi', image: 'https://image.tmdb.org/t/p/w500/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg' },
    { name: 'Rashmika Mandanna', image: 'https://image.tmdb.org/t/p/w500/5v6p4Z79FmHqGvS6nL1u_g3u8i4.jpg' },
    { name: 'Vicky Kaushal', image: 'https://image.tmdb.org/t/p/w500/869V7ZibHeXz9pYjQiRzU6op9vX.jpg' },
    { name: 'Prabhas', image: 'https://image.tmdb.org/t/p/w500/8A7YyV7eM8YyYgG1mPZ8S0T9YwQ.jpg' },
    { name: 'Shahid Kapoor', image: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg' }
  ];

  const actorDocs = [];
  for (const a of actorNames) {
    let doc = await Actor.findOne({ name: a.name });
    if (!doc) doc = await Actor.create(a);
    actorDocs.push(doc);
  }

  const getActor = (name) => actorDocs.find(a => a.name === name);

  // --- MOVIES SEEDING (15+ Latest Indian Movies 2026) ---
  const movies = [
    {
      title: 'Dhurandhar: The Revenge',
      genre: 'Action, Spy, Thriller',
      language: 'Hindi',
      rating: 9.1,
      votes: 350000,
      poster: 'https://image.tmdb.org/t/p/w500/869V7ZibHeXz9pYjQiRzU6op9vX.jpg',
      banner: 'https://image.tmdb.org/t/p/original/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg',
      category: 'Movies',
      description: 'The final showdown between Indian spies and an international syndicate.',
      cast: [
        { actor: getActor('Ranveer Singh')._id, role: 'Agent Vikram', actorName: 'Ranveer Singh', actorImage: getActor('Ranveer Singh').image },
        { actor: getActor('Sanjay Dutt')._id, role: 'Main Villain', actorName: 'Sanjay Dutt', actorImage: getActor('Sanjay Dutt').image },
        { actor: getActor('Arjun Rampal')._id, role: 'Double Agent', actorName: 'Arjun Rampal', actorImage: getActor('Arjun Rampal').image }
      ]
    },
    {
      title: 'Sikandar',
      genre: 'Action, Drama',
      language: 'Hindi',
      rating: 8.9,
      votes: 120000,
      poster: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg',
      banner: 'https://image.tmdb.org/t/p/original/3mGvM8D8mHqB1uQX6z6z8n7Y7r.jpg',
      category: 'Movies',
      description: 'Salman Khan returns in a high-octane action drama set in Mumbai.',
      cast: [
        { actor: getActor('Salman Khan')._id, role: 'Sikandar', actorName: 'Salman Khan', actorImage: getActor('Salman Khan').image },
        { actor: getActor('Rashmika Mandanna')._id, role: 'Ayesha', actorName: 'Rashmika Mandanna', actorImage: getActor('Rashmika Mandanna').image }
      ]
    },
    {
      title: 'War 2',
      genre: 'Action, Thriller',
      language: 'Hindi, Telugu',
      rating: 9.3,
      votes: 210000,
      poster: 'https://image.tmdb.org/t/p/w500/5v6p4Z79FmHqGvS6nL1u_g3u8i4.jpg',
      banner: 'https://image.tmdb.org/t/p/original/8A7YyV7eM8YyYgG1mPZ8S0T9YwQ.jpg',
      category: 'Movies',
      description: 'The YRF Spy Universe expands with a deadly face-off between Kabir and a new foe.',
      cast: [
        { actor: getActor('Hrithik Roshan')._id, role: 'Kabir', actorName: 'Hrithik Roshan', actorImage: getActor('Hrithik Roshan').image },
        { actor: getActor('Jr NTR')._id, role: 'Antagonist', actorName: 'Jr NTR', actorImage: getActor('Jr NTR').image }
      ]
    },
    {
      title: 'Bhooth Bangla',
      genre: 'Horror, Comedy',
      language: 'Hindi',
      rating: 8.5,
      votes: 95000,
      poster: 'https://image.tmdb.org/t/p/w500/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg',
      banner: 'https://image.tmdb.org/t/p/original/5mGvM8D8mHqB1uQX6z6z8n7Y7r.jpg',
      category: 'Movies',
      description: 'A cult horror comedy revival where Akshay Kumar investigates a haunted mansion.',
      cast: [
        { actor: getActor('Akshay Kumar')._id, role: 'Detective', actorName: 'Akshay Kumar', actorImage: getActor('Akshay Kumar').image }
      ]
    },
    {
      title: 'Ramayana: Part 1',
      genre: 'Mythological, Epic',
      language: 'Hindi, Tamil, Telugu',
      rating: 9.5,
      votes: 500000,
      poster: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg',
      banner: 'https://image.tmdb.org/t/p/original/8A7YyV7eM8YyYgG1mPZ8S0T9YwQ.jpg',
      category: 'Movies',
      description: 'The most anticipated Indian epic retelling of the Ramayana.',
      cast: [
        { actor: getActor('Ranbir Kapoor')._id, role: 'Lord Ram', actorName: 'Ranbir Kapoor', actorImage: getActor('Ranbir Kapoor').image },
        { actor: getActor('Sai Pallavi')._id, role: 'Sita', actorName: 'Sai Pallavi', actorImage: getActor('Sai Pallavi').image },
        { actor: getActor('Yash')._id, role: 'Ravana', actorName: 'Yash', actorImage: getActor('Yash').image }
      ]
    },
    {
      title: 'Alpha',
      genre: 'Action, Spy',
      language: 'Hindi',
      rating: 8.7,
      votes: 80000,
      poster: 'https://image.tmdb.org/t/p/w500/3mGvM8D8mHqB1uQX6z6z8n7Y7r.jpg',
      banner: 'https://image.tmdb.org/t/p/original/5v6p4Z79FmHqGvS6nL1u_g3u8i4.jpg',
      category: 'Movies',
      description: 'The first female-led spy movie in the YRF Spy Universe.',
      cast: [
        { actor: getActor('Alia Bhatt')._id, role: 'Agent Alpha', actorName: 'Alia Bhatt', actorImage: getActor('Alia Bhatt').image }
      ]
    },
    {
        title: 'Love & War',
        genre: 'Romance, Drama',
        language: 'Hindi',
        rating: 8.8,
        votes: 150000,
        poster: 'https://image.tmdb.org/t/p/w500/869V7ZibHeXz9pYjQiRzU6op9vX.jpg',
        banner: 'https://image.tmdb.org/t/p/original/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg',
        category: 'Movies',
        description: 'Sanjay Leela Bhansalis epic romance triangle.',
        cast: [
            { actor: getActor('Ranbir Kapoor')._id, role: 'Main Lead', actorName: 'Ranbir Kapoor', actorImage: getActor('Ranbir Kapoor').image },
            { actor: getActor('Alia Bhatt')._id, role: 'Main Lead', actorName: 'Alia Bhatt', actorImage: getActor('Alia Bhatt').image },
            { actor: getActor('Vicky Kaushal')._id, role: 'Lead', actorName: 'Vicky Kaushal', actorImage: getActor('Vicky Kaushal').image }
        ]
    }
  ];

  // Add remaining to reach 15+
  const placeholderMovies = [
    'Spirit', 'The Raja Saab', 'Thug Life', 'Coolie', 'Kanguva', 'Toxic', 'Sardar 2', 'Game Changer', 'Vishwambhara'
  ];

  for (const title of placeholderMovies) {
    movies.push({
      title,
      genre: 'Action, Thriller',
      language: 'Indian Multi',
      rating: 8.2 + Math.random(),
      votes: 50000 + Math.floor(Math.random() * 50000),
      poster: 'https://image.tmdb.org/t/p/w500/deS9UUn8U9fF2vY6nL1u_g3u8i4.jpg',
      banner: 'https://image.tmdb.org/t/p/original/m9fE1F3vY2Yy3gG1mPZ8S0T9YwQ.jpg',
      category: 'Movies',
      description: 'A blockbuster Indian release for 2026.',
      cast: []
    });
  }

  for (const m of movies) {
    await Movie.findOneAndUpdate({ title: m.title }, m, { upsert: true });
  }
  console.log(`Updated ${movies.length} movies.`);

  // --- IPL 2026 SPORTS SEEDING (FOR APRIL) ---
  const matches = [
    { date: '2026-04-13', team1: 'Sunrisers Hyderabad', team2: 'Rajasthan Royals', venue: 'Hyderabad' },
    { date: '2026-04-14', team1: 'Royal Challengers Bengaluru', team2: 'Kolkata Knight Riders', venue: 'Bengaluru' },
    { date: '2026-04-15', team1: 'Mumbai Indians', team2: 'Gujarat Titans', venue: 'Mumbai' },
    { date: '2026-04-16', team1: 'Delhi Capitals', team2: 'Lucknow Super Giants', venue: 'Delhi' },
    { date: '2026-04-17', team1: 'Chennai Super Kings', team2: 'Punjab Kings', venue: 'Chennai' },
    { date: '2026-04-18', team1: 'Rajasthan Royals', team2: 'Mumbai Indians', venue: 'Jaipur' },
    { date: '2026-04-19', team1: 'Kolkata Knight Riders', team2: 'Sunrisers Hyderabad', venue: 'Kolkata' },
    { date: '2026-04-20', team1: 'Gujarat Titans', team2: 'Royal Challengers Bengaluru', venue: 'Ahmedabad' },
    { date: '2026-04-21', team1: 'Lucknow Super Giants', team2: 'Delhi Capitals', venue: 'Lucknow' },
    { date: '2026-04-22', team1: 'Punjab Kings', team2: 'Chennai Super Kings', venue: 'Dharamshala' },
    { date: '2026-04-23', team1: 'Mumbai Indians', team2: 'Chennai Super Kings', venue: 'Wankhede Stadium, Mumbai', priceRange: '₹1500 - ₹25000' },
    { date: '2026-04-24', team1: 'Rajasthan Royals', team2: 'Royal Challengers Bengaluru', venue: 'Jaipur' },
    { date: '2026-04-25', team1: 'Sunrisers Hyderabad', team2: 'Kolkata Knight Riders', venue: 'Hyderabad' },
    { date: '2026-04-26', team1: 'Gujarat Titans', team2: 'Delhi Capitals', venue: 'Ahmedabad' },
    { date: '2026-04-27', team1: 'Lucknow Super Giants', team2: 'Mumbai Indians', venue: 'Lucknow' },
    { date: '2026-04-28', team1: 'Chennai Super Kings', team2: 'Sunrisers Hyderabad', venue: 'Chennai' },
    { date: '2026-04-29', team1: 'Royal Challengers Bengaluru', team2: 'Punjab Kings', venue: 'Bengaluru' },
    { date: '2026-04-30', team1: 'Kolkata Knight Riders', team2: 'Gujarat Titans', venue: 'Kolkata' }
  ];

  for (const m of matches) {
    await Event.findOneAndUpdate(
      { title: `${m.team1} vs ${m.team2} - IPL 2026` },
      {
        title: `${m.team1} vs ${m.team2} - IPL 2026`,
        category: 'cricket',
        venue: m.venue,
        city: m.venue.split(',').pop().trim(),
        date: m.date,
        time: '07:30 PM',
        priceFrom: 800,
        priceTo: m.priceRange ? parseInt(m.priceRange.split('-')[1].replace('₹', '').replace(',', '')) : 5000,
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2000&auto=format&fit=crop',
        description: `TATA IPL 2026: ${m.team1} takes on ${m.team2} in this thrilling league stage match. Experience the madness live at the stadium!`,
        language: 'Hindi/English',
        ageLimit: 'All Ages',
        status: 'active'
      },
      { upsert: true }
    );
  }
  console.log(`Updated ${matches.length} IPL matches.`);

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
