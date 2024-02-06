import { Movie, RecentlySearched } from '../models/Movie.js';
let savedMovies, totalMovies, totalTimesWatched, sortCriteria, recentlySearched, summary;

export const showMovies = async (req, res) => {
  await aggregateMoviesData();
  savedMovies = await Movie.find().sort(sortCriteria);
  res.render('index', { savedMovies, totalMovies, totalTimesWatched, searchResults: null, recentlySearched });
}

export const searchMovies = async (req, res) => {
  const movieTitle = req.body.movieTitle;

  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie = await response.json();
    console.log(movie);

    const response2 = await fetch(`http://www.omdbapi.com/?s=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie2 = await response2.json();
    console.log(movie2);

    await aggregateMoviesData();
    savedMovies = await Movie.find().sort(sortCriteria);

    if (!recentlySearched) {
      recentlySearched = [];
    }

    recentlySearched.unshift(movie);

    if (recentlySearched.length > 8) {
      recentlySearched = recentlySearched.slice(0, 8);
    }

    await RecentlySearched.findOneAndUpdate(
      { identifier: 'recentlySearched' }, // Use identifier instead of _id
      { $set: { movies: recentlySearched } },
      { upsert: true }
    );

    res.render('index', {
      savedMovies,
      totalMovies,
      totalTimesWatched,
      searchResults: [movie],
      movie2,
      recentlySearched
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send('Error fetching data');
  }
};


export const saveMovie = async (req, res) => {
  const { title, poster, director, year, boxOffice } = req.body;

  try {
    // Check if the movie already exists in the database
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      // If movie exists, increment the timesWatched
      movie.timesWatched += 1;
      await movie.save();
    } else {
      // If movie doesn't exist, create a new one
      movie = new Movie({
        title,
        poster,
        director,
        year,
        boxOffice,
        timesWatched: 1
      });
      await movie.save();
    }
    req.flash('success', `\"${movie.title}\" added to Your Movies`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const watchMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    }
    
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
  
};

export const deleteMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const result = await Movie.findByIdAndDelete(movieId);
    console.log(result.title);
    req.flash('warning', `\"${result.title}\" deleted`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const sortMovies = async (req, res) => {
  try {
    sortCriteria = { title: 1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null, // Grouping without a specific field to aggregate all documents
          totalMovies: { $sum: 1 }, // Counting the total number of movies
          totalTimesWatched: { $sum: "$timesWatched" } // Summing up all timesWatched values
        }
      }
    ]);

    if (result.length > 0) {
      // Extracting the result from the first element of the result array
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      console.log(`Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}`);
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};


//new code
export const seeAllMovies = async (req, res) => {
  try {
    const allMovies = await Movie.find().sort({ title: 1 });
    res.render('index', { savedMovies: allMovies, totalMovies, totalTimesWatched, searchResults: null, recentlySearched, showAllMovies: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};


