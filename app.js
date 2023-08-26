require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

const genreName = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Store fetched data in-memory
let cachedData = null;

app.get("/", (req, res) => {
    if (cachedData) {
        // Serve cached data if available
        res.render("home", { data: cachedData.response1.data.results, allGenreMovieData: cachedData.results, genreArray: cachedData.genreNames });
    } else {
        let randomNum = Math.floor(Math.random() * 4 + 1);

        const request1 = axios.get("https://api.themoviedb.org/3/movie/popular?api_key=" + process.env.API_KEY + "&page=" + randomNum);
        const request2 = axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=" + process.env.API_KEY);

        axios.all([request1, request2])
            .then(axios.spread((response1, response2) => {
                // Extract genres from response2
                const genres = response2.data.genres;
                const genreNames = genres.map(item => item.name);

                // Create an array of promises for movie requests
                const movieRequests = genres.map(genre => {
                    const apiUrl = `https://api.themoviedb.org/3/discover/movie`;
                    const queryParams = {
                        api_key: process.env.API_KEY,
                        page: randomNum,
                        with_genres: genre.id
                    };

                    return axios.get(apiUrl, { params: queryParams })
                        .then(response => response.data.results);
                });

                // Execute all movie requests concurrently
                Promise.all(movieRequests)
                    .then(results => {
                        // 'results' is an array of arrays containing movie data for each genre
                        const responseData = results.flat(); // Flatten the array of arrays
                        // Cache the fetched data
                        cachedData = { response1, results, genreNames };
                        res.render("home", { data: response1.data.results, allGenreMovieData: results, genreArray: genreNames }); // Render the data
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        res.status(500).send('Internal Server Error');
                    });
            }))
            .catch(error => {
                console.log(error);
                res.status(500).send('Internal Server Error');
            });
    }
});

app.get("/favicon.ico", (req, res) => {
    // Send a response for the favicon request (e.g., a 204 No Content response)
    res.status(204).end();
});

app.get("/:id", (req, res) => {
    const movieId = req.params.id;

    const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`;
    const movieCreditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.API_KEY}`;
    const videoClip = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.API_KEY}`;
    const recommendedMovies = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${process.env.API_KEY}`;

    axios.all([
        axios.get(movieDetailsUrl),
        axios.get(movieCreditsUrl),
        axios.get(videoClip),
        axios.get(recommendedMovies)
    ])
        .then(axios.spread((detailsResponse, creditsResponse, videoResponse, recommendedMovieData) => {
            const movieData = detailsResponse.data;
            const creditsData = creditsResponse.data.cast;
            const videoData = videoResponse.data.results;
            const recommendedMovieLists = recommendedMovieData.data.results;

            res.render("about", { movieData, creditsData, videoData, recommendedMovieLists});
        }))
        .catch(error => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(3000, () => {
    console.log("Server is running at port 3000");
});