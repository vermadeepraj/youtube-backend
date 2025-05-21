import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},

  { timestamps: true }
)
playlistSchema.plugin(mongooseAggregatePaginate)
export const PlayList = mongoose.model("PlayList", playlistSchema)