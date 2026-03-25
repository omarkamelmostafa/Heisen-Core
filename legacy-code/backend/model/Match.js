import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const MatchSchema = new mongoose.Schema({
  // _id: mongoose.Schema.ObjectId,

  league_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "League",
  },
  round_number: {
    type: Number,
    required: true,
    min: 1,
  },
  teams: [
    {
      teamName: {
        type: String,
        required: true,
      },
      home_away: {
        type: String,
        required: true,
        enum: ["home", "away"],
      },
      url: {
        type: String,
        required: true,
        validate: {
          validator: (url) => /^(https?:\/\/.*)$/.test(url),
          message: "Invalid team URL format.",
        },
      },
    },
    {
      teamName: {
        type: String,
        required: true,
      },
      home_away: {
        type: String,
        required: true,
        enum: ["home", "away"],
      },
      url: {
        type: String,
        required: true,
        validate: {
          validator: (url) => /^(https?:\/\/.*)$/.test(url),
          message: "Invalid team URL format.",
        },
      },
    },
  ],
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
    ref: "Venue",
  },
  details_url: {
    type: String,
    required: true,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid URL format.",
    },
  },
  uuid: { type: String, default: uuidv4 },
  scraped_at: {
    type: Date,
    default: Date.now,
  },
});

const Match = mongoose.model("Match", MatchSchema);

export default Match;
