import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//Creating tweets
const createTweet = asyncHandler(async (req, res) => {
        const {content} = req.body;
        const userId = req.userId;

        if(!content || content.length >200){
            throw new ApiError(400,"Tweet content is required and it must be under 200 characters.");
        }

        const tweet = await Tweet.create({content, owner: userId});

        return res
            .status(201)
            .json(new ApiResponse(201, tweet, "Tweet created successfully."));

})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.userId;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id.");
    }

    const tweets = await Tweet.find({owner: userId})

    if(!tweets.length){
        throw new ApiError(404,"No tweets found for this user.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully."))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id");
    }
    if(!content  || content.length > 200){
        throw new ApiError(400, "Tweet must be under 200 characters");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId, owner: req.user.id },
        { content },
        { new: true }
    )

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized to update");
    }

    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: req.user.id });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized to delete");
    }

    res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully."));
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}