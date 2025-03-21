const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        min: 4,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 60,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    firstName: {
        type: String,
        required: true,
        min: 1,
        max: 20
    },
    lastName: {
        type: String,
        required: true,
        min: 1,
        max: 20
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
        max: 150
    },
    city: {
        type: String,
        max: 50
    },
    from: {
        type: String,
        max: 50
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3]
    }
}, { timestamps: true });

const userModel = mongoose.model("User", UserSchema);

module.exports = userModel;
