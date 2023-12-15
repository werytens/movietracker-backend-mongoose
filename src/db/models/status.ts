import mongoose from "../database";

export const statusSchema = new mongoose.Schema({
    name: String
})

export const statusModel = mongoose.model('status', statusSchema);