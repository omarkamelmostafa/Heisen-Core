import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema(
  {
    matchId: {
      type: String,
      required: [true, "Match ID is required"],
    },
    leagueId: {
      type: String,
      required: [true, "League ID is required"],
    },
    homeTeamName: {
      type: String,
      required: [true, "Home team name is required"],
      maxlength: [50, "Home team name cannot be more than 50 characters long"],
    },
    awayTeamName: {
      type: String,
      required: [true, "Away team name is required"],
      maxlength: [50, "Away team name cannot be more than 50 characters long"],
    },
    homeTeamPriorMatchStats: {},
    awayTeamPriorMatchStats: {},
    homeTeamOpponents: [],
    awayTeamOpponents: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Stats = mongoose.model("Stats", StatsSchema);
export default Stats;
