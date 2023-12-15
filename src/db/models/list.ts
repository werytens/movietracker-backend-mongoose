import mongoose from "../database";

export const listSchema = new mongoose.Schema({
    userId: String,
    filmId: String,
    statusId: String
})

export const listModel = mongoose.model('list', listSchema);