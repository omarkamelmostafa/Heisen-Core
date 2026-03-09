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

// import mongoose from "mongoose";

// const MatchSchema = new mongoose.Schema(
//   {
//     homeTeamName: {
//       type: String,
//       required: [true, "Home team name is required"],
//       maxlength: [50, "Home team name cannot be more than 50 characters long"],
//     },
//     awayTeamName: {
//       type: String,
//       required: [true, "Away team name is required"],
//       maxlength: [50, "Away team name cannot be more than 50 characters long"],
//     },
//     matchDate: {
//       type: String,
//       required: [true, "Match date is required"],
//     },
//     matchHour: {
//       type: String,
//       required: [true, "Match hour is required"],
//     },
//     matchRoundNumber: {
//       type: Number,
//       required: [true, "Match round number is required"],
//       validate: {
//         validator: function (value) {
//           return value > 0;
//         },
//         message: "Match round number must be greater than 0",
//       },
//     },
//     leagueId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "League",
//       required: [true, "League ID is required"],
//     },
//     leagueName: {
//       type: String,
//       required: [true, "League name is required"],
//       maxlength: [50, "League name cannot be more than 50 characters long"],
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     awayTeamUrl: {
//       type: String,
//       validate: {
//         validator: function (value) {
//           const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
//           return urlRegex.test(value);
//         },
//         message: "Away team URL must be a valid URL",
//       },
//     },
//     homeTeamUrl: {
//       type: String,
//       validate: {
//         validator: function (value) {
//           const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
//           return urlRegex.test(value);
//         },
//         message: "Home team URL must be a valid URL",
//       },
//     },
//   },
//   { timestamps: true }
// );

// const Match = mongoose.model("Match", MatchSchema);
// export default Match;
