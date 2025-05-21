import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name?.trim()){
        throw new ApiError(400, "Playlist name is required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id,
        videos: [],
    })

    return res
        .status(201)
        .json(new ApiResponse(201, playlist , "Playlist created successfully"))
})
// Paginated + searchable playlist lit
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const {page=1, limit=10, search=""} = req.query;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }
    const pipeline = [
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId),
                $or: [
                    {name: {$regex: search, $options: "i"}},
                    {description: {$regex: search, $options: "i"}}
                ]
            }
        },
        {$sort: {createdAt: -1}}
    ];

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            totalDocs: "totalPlaylists",
            docs: "playlists"
        }
    };
    const result = await Playlist.aggregatePaginate(Playlist.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Paginated playlist fetched"))
})

//Get single playlist
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res 
        .status(200)
        .json(new ApiResponse(200, playlist,"PlayList fetched successfully"))
})

//Adding video to the playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
})

//Removing video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
      }
    
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new ApiError(404, "Playlist not found");
    
      playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId
      );
      await playlist.save();
    
      return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
      }
    
      const playlist = await Playlist.findByIdAndDelete(playlistId);
      if (!playlist) throw new ApiError(404, "Playlist not found");
    
      return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
      }
    
      const updates = {};
      if (name?.trim()) updates.name = name;
      if (description?.trim()) updates.description = description;
    
      const playlist = await Playlist.findByIdAndUpdate(playlistId, updates, {
        new: true,
      });
    
      if (!playlist) throw new ApiError(404, "Playlist not found");
    
      return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}