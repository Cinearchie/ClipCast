import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res)=> {
    const {fullname , email , username , password} = req.body

    //validation

    if([fullname , username , email , password].some((field) =>field?.trim() === "")){
        throw new ApiError(400 , "All fields are required!")
    }
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(405 , "Username or email already exists!")
    }

   const avatarLocalPath =  req.files?.avatar?.[0]?.path
   const coverLocalPath =  req.files?.coverImage?.[1]?.path

   if(!avatarLocalPath){
        throw new ApiError(405 , "Cover image is a compulsory field")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // const coverImage = await uploadOnCloudinary(coverLocalPath)

    let avatar;
    try{
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar successfully!",avatar)
    }catch(error){
        console.log("Error uploading avatar",error)
        throw new ApiError(500, "Avatar loading failed")
    }

    let coverImage;
    try{
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Uploaded cover image successfully!",coverImage)
    }catch(error){
        console.log("Error uploading coverImage",error)
        throw new ApiError(500, "Cover Image loading failed")
    }

    try{
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
        if(!createdUser){
            throw new ApiError(500 , "Something went wrong , while saving user details!")
        }
    
        return res
            .status(201)
            .json(new ApiResponse(200,createdUser , "User registered successfully"))

    }catch(error){
        console.log("User creatation failed")
        if(avatar){
           await deleteCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteCloudinary(coverImage.public_id)
         }
         throw new ApiError(500 , "SOmething went wrong while registering user")
    }
    
})

export {
    registerUser
}