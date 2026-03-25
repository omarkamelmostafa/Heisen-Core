import mongoose from "mongoose";
import { teamSchema } from "./League.js";

const Team = mongoose.model("Team", teamSchema);

export default Team;
