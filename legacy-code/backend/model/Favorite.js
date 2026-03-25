import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Ensure each user has only one document in the collection
  },
  favorite: [
    {
      sport: {
        type: String,
        required: true,
      },
      teamIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
      ],
      leagueIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "League",
          required: true,
        },
      ],
    },
  ],
});

const Favorite = mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
