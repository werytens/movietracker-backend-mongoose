require('dotenv').config()
import { FilmDto } from "src/controllers/films.controller";


export class ImdbAPI {
    static async getFilm(id) {
        const response = await (await fetch(process.env.IMDB_API_LINK + '?i=' + id  + '&apikey=' + process.env.API_KEY)).json();

        if (response.Error) {
            return response
        }

        const filmDto: FilmDto = {
            title: response.Title,
            description: response.Plot,
            rate: response.imdbRating,
            metascore: response.Metascore,
            genre: response.Genre,
            releaseDate: response.Released,
            runtime: response.Runtime,
            writer: response.Writer,
            actors: response.Actors,
            poster: response.Poster,
            votersCount: response.imdbVotes.replace(",", '.'),
            imdbID: response.imdbID
        };

        return filmDto
    }
}

export class kinopoiskAPI {
    static async getFilm(id) {
        const response = await fetch(process.env.API_KINOPOISKID_LINK + id, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.API_KINOPOISK_KEY
            }
        })

        const responseData = await (await response).json();

        const filmDto: FilmDto = {
            title: responseData.nameOriginal,
            description: responseData.description,
            rate: responseData.ratingImdb,
            metascore: 0,
            genre: responseData.genres.map(item => item.genre).join(' '),
            releaseDate: String(responseData.year),
            runtime: String(responseData.filmLength) + ' ' + 'min',
            writer: '',
            actors: '',
            poster: responseData.posterUrl,
            votersCount: responseData.ratingImdbVoteCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            imdbID: null 
        };

        return filmDto;
    }
} 