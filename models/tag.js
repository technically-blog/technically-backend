const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        image: {
            data: Buffer,
            contentType: String
        },
        info: {
            type: String,
            required: true,
            max: 160
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Tag', tagSchema);