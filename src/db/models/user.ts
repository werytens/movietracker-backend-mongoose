import mongoose from "../database";

export const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    passwordHash: String,
    avatarLink: String,
    status: String,
})

export const userModel = mongoose.model('user', userSchema);