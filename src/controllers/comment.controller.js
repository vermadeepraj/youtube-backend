import mongoose from "mongoose"
// import { SchemaType } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const result = await Comment.aggregatePaginate(
        Comment.aggregate([
            {$match: {video: new mongoose.Types.ObjectId(videoId)}},
            {
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {$project: {fullName: 1, username: 1, avatar: 1}}
                    ]
                }
            },
            {$addFields: {owner: {$first: "$owner"}}},
            {$sort: {createdAt: -1}}
        ]),
        {
            page: parseInt(page),
            limit: parseInt(limit),
            customLabels: {
                docs: "comments",
                totalDocs: "totalComments",
                totalPages: "totalPages"
            }
        }
    )

    return res.status(200).json(
        new ApiResponse(200, result, "Comments fetched successfully!")
    )

})

const addComment = asyncHandler(async (req, res) => {
    const videoId = req.params;
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Comment contetn is required")
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    return res.status(201).json(
        new ApiResponse(200, comment, "comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Updated contetn is required");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "comment not found")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "You can only update your own comment")
    }

    comment.content = content;
    await comment.save();

    return res.status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "You can only delete your own comment")
    }

    await comment.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }