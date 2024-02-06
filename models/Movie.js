

// models --> Movie.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const movieSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  poster: {
    type: String,
    required: true
  },
  director: String,
  year: { 
    type: Number, 
    required: true 
  },
  boxOffice: {
    type: String,
    default: 'N/A'
  },
  timesWatched: { 
    type: Number, 
    default: 0 
  }
});

const recentlySearchedSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    default: 'recentlySearched',
  },
  movies: [movieSchema]
});

const Movie = mongoose.model('Movie', movieSchema);
const RecentlySearched = mongoose.model('RecentlySearched', recentlySearchedSchema);

export { Movie, RecentlySearched };