import mongoose from "mongoose";

const VALID_COUNTRIES = [
    "South Korea",
    "Japan",
    "China",
    "Thailand",
    "India",
    "USA",
    "Taiwan",
    "Philippines",
    "France"
];

const seasonSchema = new mongoose.Schema({
    seasonNumber: Number,
    episodes: [
        {
            episodeNumber: Number,
            title: String,
            videoUrl: String,
            thumbnail: String,
            servers: [
                {
                    name: String,
                    url: String
                }
            ]
        }
    ]
});

const contentSchema = new mongoose.Schema(
    {
        tmdbId: {
            type: Number,
            unique: true,
            sparse: true
        },

        title: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["movie", "series", "anime"],
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        thumbnail: String,
        trailerUrl: String,

        genre: {
            type: [String],
            default: []
        },

        countries: {
            type: [
                {
                    type: String,
                    enum: VALID_COUNTRIES
                }
            ],
            default: [],
            index: true
        },

        episodes: [
            {
                episodeNumber: Number,
                title: String,
                videoUrl: String,
                thumbnail: String,
                servers: [
                    {
                        name: String,
                        url: String
                    }
                ]
            }
        ],

        seasons: [seasonSchema],

        releaseYear: Number,

        rating: {
            type: Number,
            default: 0
        },

        views: {
            type: Number,
            default: 0
        },

        viewsLast24h: {
            type: Number,
            default: 0
        },

        source: {
            type: String,
            default: "tmdb"
        }
    },
    { timestamps: true }
);

contentSchema.index({
    "seasons.seasonNumber": 1,
    "seasons.episodes.episodeNumber": 1
});


export default mongoose.model("Content", contentSchema);