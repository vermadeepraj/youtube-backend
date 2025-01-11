import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
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
      $set: {
        refreshToken: undefined
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
   if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"Refresh token is expired or used")
   }
 
   const options = {
     httpOnly:true,
     secure: true
   }
 
  const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)
 
   return res
   .status(200)
   .cookie("refreshToken",newRefreshToken, options)
   .cookie("accessToken",accessToken,options)
   .json(
     new ApiResponse(
       200,
       {accessToken, refreshToken: newRefreshToken},
       "Access token refreshed successfully"
     )
   )
 } catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
 }

})


export { registerUser, loginUser, logoutUser, refreshAccessToken }