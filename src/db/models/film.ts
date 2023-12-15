import mongoose from "../database";

export const filmSchema = new mongoose.Schema({
    title: String,
    description: String,
    rate: String,
    merascore: String,
    genre: String,
    releaseDate: String,
    runtime: String,
    writer: String,
    actors: String,
    poster: String,
    votersCount: String,
    imdbID: String
})

export const filmModel = mongoose.model('film', filmSchema);
