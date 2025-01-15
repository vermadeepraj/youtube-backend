import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import { application } from 'express'
import { configDotenv } from 'dotenv'
import mongoose, {Schema} from 'mongoose'
// import cookieParser from 'cookie-parser'


//generating access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    //sabse pehle user find krna hai
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken //storing refresh token in db
    await user.save({ validateBeforeSave: false }) //saving

    //returning access and refresh token
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

//REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  // validation -- not empty
  //check if user already exists
  //check for images, check for avatar
  //upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res, if not then return error


  const { fullName, email, username, password } = req.body
  // console.log("email:", email)

  // if (fullName === "") {
  //   throw new ApiError(400, "fullName is required")
  // } oRRRR
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })  // returns first find user
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }
  // console.log(req.files);
  // handling images
  const avatarLocalPath = req.files?.avatar[0]?.path; //0-> first property
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }
  //uploading them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  //entry in database user kar rha h
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"  //kya kya nhi chahiye matlav hata do
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }
  //returning response from Apiresponse

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )


})

//-------------LOGIN USER-----------------
const loginUser = asyncHandler(async (req, res) => {
  //req body s data le aao
  //username or email
  //find user
  //if user is found, password check.
  //if password is right then we need to generate refresh and access token and give to user
  //send tokens in the form of cookies
  //send response of successful

  const { email, username, password } = req.body

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required")
  }
  //finding  user 
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "user does not exists");
  }

  //password check
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }
  //refresh token nd refresh toke
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  //optional steps
  const loggedInInUser = await User.findById(user._id).select("-password -refreshToken")

  //sending cookies
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(  //sending response
        200,
        {
          user: loggedInInUser, accessToken, refreshToken
        },
        "User logged in successfully"
      )
    )
})

//--------------LOGOUT USER--------------
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    //update
    {
      $unset: {
        refreshToken:1 //this removes the field from document
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
})
//pehle cookies hata do
//refresh token ko reset  => got to auth.midddleware

//-----------Refresh token end point----------
const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }
  //verifying incoming refresh token
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
    )
    //finding token from database
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body


  const user = await User.findById(req.user._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully")
    )

})

//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

//updating details that user want
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, } = req.body

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required")
  }
  //finding user
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName, //OR fullName: fullName
        email: email, // OR email
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully!"))

})

//update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path  //from multer middleware
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },  //update field
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))

})

//update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path.url

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage")
  }
  const user = await User.findByIdAndUpdate(
    coverImage,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

//aggregation pipelines

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing")
  }
  // User.find({username})

  // ----------------PIPELINES----------------
  const channel = await User.aggregate([
    {
      //matching users
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      //how  many subscribers using channel
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {//hoe=w many you have subscribed to throwr subscribers
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribers",
        as: "subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount: {
          $size: "$subscribers"
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          id: {$in:[req.user?._id, "$subscribers.subscribe"]},
          then:true,
          else:false
        }
      }
    },
    {
      $project:{
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "Channel does not exists")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

})

//-----watch history -->sub pipelines-------
const getWatchHistory = asyncHandler(async(req, res)=>{
  // req.use._id //we get string through this method
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //for subpipelines
        pipeline: [
          {
            $lookup:{
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              //subpipeline
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"  // 0 indexed values
              }
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(new ApiResponse(200, 
    user[0].watchHistory, 
    "Watch History fetched successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}