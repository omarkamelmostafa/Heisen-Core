import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
// import { teamSchema } from "./Team";

export const teamSchema = new mongoose.Schema({
  league_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "League",
  },
  teamName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid team URL format.",
    },
  },
  avatarUrl: {
    type: String,
    required: false,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid team avatar URL format.",
    },
  },
  avatarFilename: {
    type: String,
    required: false,
  },
  uuid: { type: String, default: uuidv4 },
});

const leagueSchema = new mongoose.Schema({
  leagueName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid league URL format.",
    },
  },
  avatarUrl: {
    type: String,
    required: false,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid league avatar URL format.",
    },
  },
  avatarFilename: {
    type: String,
    default: "",
    validate: {
      validator: function (value) {
        // Check if the value is empty or the file type is an image
        if (!value) {
          return true; // Empty value is valid
        }
        const fileExtension = value.split(".").pop().toLowerCase();
        const allowedFileTypes = ["jpg", "jpeg", "png"];
        const isImage = allowedFileTypes.includes(fileExtension);
        return isImage;
      },
      message: "Avatar must be a valid image file (jpg, jpeg, png, gif)",
    },
    maxlength: [5242880, "Avatar size cannot exceed 5 MB"],
  },
  matchesFixture: {
    type: String,
    required: true,
    validate: {
      validator: (url) => /^(https?:\/\/.*)$/.test(url),
      message: "Invalid matches fixture URL format.",
    },
  },
  seasonFrom: {
    type: String,
    required: true,
    lowercase: true, // Convert to lowercase for case-insensitive comparison
    enum: [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ],
  },
  seasonTo: {
    type: String,
    required: true,
    lowercase: true, // Convert to lowercase for case-insensitive comparison
    enum: [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ],
    validate: {
      validator: function (value) {
        return this.seasonFrom !== value;
      },
      message: 'Season "to" must be different from season "from".',
    },
  },
  sport: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  numberOfTeams: {
    type: Number,
    required: [true, "Number of teams is required"],
    validate: {
      validator: function (value) {
        return value >= 2;
      },
      message: "Number of teams must be at least 2",
    },
  },

  country: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  uuid: { type: String, default: uuidv4 },
  teams: [teamSchema],
});

const League = mongoose.model("League", leagueSchema);

export default League;
