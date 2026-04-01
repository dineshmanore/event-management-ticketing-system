const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Define Models (Internal)
const ActorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  tmdbId: Number
});
const Actor = mongoose.models.Actor || mongoose.model('Actor', ActorSchema);

const MovieCastSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
  role: String,
  actorName: String,
  actorImage: String
}, { _id: false });

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: String,
  language: String,
  rating: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  poster: String,
  banner: String,
  trailerUrl: String,
  description: String,
  category: String,
  releaseDate: Date,
  cast: [MovieCastSchema]
}, { timestamps: true });
const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

const EventSchema = new mongoose.Schema({
  title: String,
  category: String,
  venue: String,
  city: String,
  date: Date,
  time: String,
  priceFrom: Number,
  priceTo: Number,
  image: String,
  banner: String,
  description: String,
  language: String,
  ageLimit: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const StreamSchema = new mongoose.Schema({
  title: String,
  genres: String,
  language: String,
  rating: Number,
  duration: String,
  price_rent: Number,
  price_buy: Number,
  release_date: Date,
  trailer_url: String,
  poster_image: String,
  banner_image: String,
  description: String,
  status: { type: String, default: 'active' }
});
const Stream = mongoose.models.Stream || mongoose.model('Stream', StreamSchema);

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI missing');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Clear Collections
    await Movie.deleteMany({});
    await Event.deleteMany({});
    await Stream.deleteMany({});
    await Actor.deleteMany({});
    console.log('Cleared existing data');

    // 2. Seed Actors
    const actorsData = [
      { name: 'Akshay Kumar', image: 'https://image.tmdb.org/t/p/w500/9it5pByP26r2tSntS25P870Kk06.jpg' },
      { name: 'Emraan Hashmi', image: 'https://image.tmdb.org/t/p/w500/q3lW5C5rX4WjF5v5v5v5v5v5v5v.jpg' }, // Placeholder for Hashmi
      { name: 'Salman Khan', image: 'https://image.tmdb.org/t/p/w500/40wE9jW7v9SntS25P870Kk06.jpg' },
      { name: 'Adivi Sesh', image: 'https://image.tmdb.org/t/p/w500/q6W5C5rX4WjF5v5v5v5v5v5v5v.jpg' },
      { name: 'Mrunal Thakur', image: 'https://image.tmdb.org/t/p/w500/q7W5C5rX4WjF5v5v5v5v5v5v5v.jpg' },
      { name: 'Paresh Rawal', image: 'https://image.tmdb.org/t/p/w500/paresh_rawal.jpg' },
      { name: 'Rajpal Yadav', image: 'https://image.tmdb.org/t/p/w500/rajpal_yadav.jpg' },
      { name: 'Disha Patani', image: 'https://image.tmdb.org/t/p/w500/disha_patani.jpg' },
      { name: 'Tabu', image: 'https://image.tmdb.org/t/p/w500/tabu_actor.jpg' }
    ];
    const createdActors = await Actor.insertMany(actorsData);
    console.log(`Inserted ${createdActors.length} actors`);

    const getActor = name => createdActors.find(a => a.name === name);

    // 3. Seed Movies (April 2026)
    const movies = [
      {
        title: 'Bhooth Bangla',
        genre: 'Horror, Comedy',
        language: 'Hindi',
        rating: 8.9,
        votes: 15400,
        category: 'Premiere',
        poster: 'https://images.hindustantimes.com/img/2024/09/09/1600x900/akshay_kumar_bhooth_bangla_1725854651336_1725854660424.jpg',
        banner: 'https://stat5.bollywoodhungama.in/wp-content/uploads/2024/09/Bhooth-Bangla.jpg',
        trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'A fantasy horror-comedy directed by Priyadarshan. A man moves into a haunted mansion only to find he has very unusual roommates.',
        releaseDate: new Date('2026-04-10'),
        cast: [
          { actor: getActor('Akshay Kumar')._id, role: 'Lead Protagonist', actorName: 'Akshay Kumar', actorImage: getActor('Akshay Kumar').image },
          { actor: getActor('Paresh Rawal')._id, role: 'Uncle', actorName: 'Paresh Rawal', actorImage: getActor('Paresh Rawal').image },
          { actor: getActor('Rajpal Yadav')._id, role: 'Ghost Hunter', actorName: 'Rajpal Yadav', actorImage: getActor('Rajpal Yadav').image }
        ]
      },
      {
        title: 'Awarapan 2',
        genre: 'Action, Thriller, Drama',
        language: 'Hindi',
        rating: 9.1,
        votes: 8200,
        category: 'Movies',
        poster: 'https://stat2.bollywoodhungama.in/wp-content/uploads/2016/03/Awarapan-2.jpg',
        banner: 'https://stat2.bollywoodhungama.in/wp-content/uploads/2024/03/Awarapan-2-Banner.jpg',
        trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Shivva returns in this dark urban thriller. An older, more dangerous man faces his past in the neon-lit streets of Mumbai.',
        releaseDate: new Date('2026-04-03'),
        cast: [
          { actor: getActor('Emraan Hashmi')._id, role: 'Shivva', actorName: 'Emraan Hashmi', actorImage: getActor('Emraan Hashmi').image },
          { actor: getActor('Disha Patani')._id, role: 'Zoya', actorName: 'Disha Patani', actorImage: getActor('Disha Patani').image }
        ]
      },
      {
        title: 'Sikandar',
        genre: 'Action, Drama',
        language: 'Hindi',
        rating: 9.5,
        votes: 45000,
        category: 'Premiere',
        poster: 'https://images.indianexpress.com/2024/04/salman-khan-sikandar.jpg',
        banner: 'https://stat5.bollywoodhungama.in/wp-content/uploads/2024/04/Sikandar-Banner.jpg',
        trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Salman Khan stars in this high-octane Eid 2026 blockbuster about a man who takes on a powerful criminal empire to save his city.',
        releaseDate: new Date('2026-04-17'),
        cast: [
          { actor: getActor('Salman Khan')._id, role: 'Sikandar', actorName: 'Salman Khan', actorImage: getActor('Salman Khan').image }
        ]
      },
      {
        title: 'Dacoit: A Love Story',
        genre: 'Action, Romance',
        language: 'Telugu, Hindi',
        rating: 8.7,
        votes: 12000,
        category: 'Movies',
        poster: 'https://m.media-amazon.com/images/M/MV5BMjA0NzE1MzYtZDcwNy00ZDRhLWE0M2ItNTVhNzI0ZWNmNmU4XkEyXkFqcGc@._V1_.jpg',
        banner: 'https://stat5.bollywoodhungama.in/wp-content/uploads/2023/12/Dacoit-Banner.jpg',
        trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'An angry, wrongly convicted man escapes from prison to seek vengeance and find his lost love.',
        releaseDate: new Date('2026-04-10'),
        cast: [
          { actor: getActor('Adivi Sesh')._id, role: 'Dacoit', actorName: 'Adivi Sesh', actorImage: getActor('Adivi Sesh').image },
          { actor: getActor('Mrunal Thakur')._id, role: 'Princess', actorName: 'Mrunal Thakur', actorImage: getActor('Mrunal Thakur').image }
        ]
      }
    ];
    await Movie.insertMany(movies);
    console.log('Inserted movies');

    // 4. Seed Events (India-Only)
    const events = [
      {
        title: 'IPL 2026: MI vs CSK',
        category: 'event',
        venue: 'Wankhede Stadium',
        city: 'Mumbai',
        date: new Date('2026-04-14'),
        time: '7:30 PM',
        priceFrom: 1500,
        priceTo: 12500,
        image: 'https://iplstatic.s3.amazonaws.com/ipl/IPL_Logo.png',
        banner: 'https://static.abplive.com/wp-content/uploads/2024/03/IPL-MI-CSK.jpg',
        description: 'The El Clasico of IPL. Witness the greatest rivalry in cricket as Mumbai Indians take on Chennai Super Kings.',
        language: 'Hindi, English',
        ageLimit: '6+'
      },
      {
        title: 'Karan Aujla: P-Pop Culture Tour',
        category: 'concert',
        venue: 'MMRDA Grounds, BKC',
        city: 'Mumbai',
        date: new Date('2026-04-12'),
        time: '6:00 PM',
        priceFrom: 999,
        priceTo: 4999,
        image: 'https://assets-in.bmscdn.com/nmhp/events/karanaujla-india-tour-banner.jpg',
        description: 'The King of Punjabi Pop is back with his biggest tour yet. Experience the energy of P-Pop live.',
        language: 'Punjabi, Hindi',
        ageLimit: '12+'
      },
      {
        title: 'Calvin Harris Live in Mumbai',
        category: 'concert',
        venue: 'NSCI Dome',
        city: 'Mumbai',
        date: new Date('2026-04-18'),
        time: '8:00 PM',
        priceFrom: 3500,
        priceTo: 15000,
        image: 'https://assets-in.bmscdn.com/nmhp/events/calvin-harris-mumbai-banner.jpg',
        description: 'Global superstar DJ Calvin Harris makes his long-awaited return to India for one night only.',
        language: 'English',
        ageLimit: '18+'
      },
      {
        title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat',
        category: 'comedy',
        venue: 'Siri Fort Auditorium',
        city: 'Delhi',
        date: new Date('2026-04-05'),
        time: '7:00 PM',
        priceFrom: 799,
        priceTo: 2999,
        image: 'https://assets-in.bmscdn.com/nmhp/events/anubhav-singh-bassi-tour.jpg',
        description: 'Bassi is back with new stories. A laughter riot guaranteed as he shares his life experiences.',
        language: 'Hindi',
        ageLimit: '16+'
      }
    ];
    await Event.insertMany(events);
    console.log('Inserted events');

    // 5. Seed Streams
    const streams = [
      {
        title: 'Fighter (4K)',
        genres: 'Action, Patriotic',
        language: 'Hindi',
        rating: 8.5,
        duration: '2h 45m',
        price_rent: 199,
        price_buy: 499,
        release_date: new Date('2026-01-25'),
        trailer_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        poster_image: 'https://stat2.bollywoodhungama.in/wp-content/uploads/2022/12/Fighter.jpg',
        banner_image: 'https://stat5.bollywoodhungama.in/wp-content/uploads/2022/12/Fighter-Banner.jpg',
        description: 'India top aviators face a looming threat in this high-frequency aerial action spectacle.'
      }
    ];
    await Stream.insertMany(streams);
    console.log('Inserted streams');

    console.log('--- SEEDING COMPLETE ---');
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
