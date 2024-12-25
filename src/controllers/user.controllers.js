import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  // Validation
  if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(405, "Username or email already exists!");
  }
  console.log("req.files:", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(405, "Avatar is a compulsory field");
  }
  let avatar;
  let coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded avatar successfully!", avatar);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw new ApiError(500, "Avatar uploading failed");
  }
  if (coverLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverLocalPath);
      console.log("Uploaded cover image successfully!", coverImage);
    } catch (error) {
      console.error("Error uploading coverImage:", error);
      throw new ApiError(500, "Cover Image uploading failed");
    }
  } else {
    console.warn("No cover image provided");
  }
  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while saving user details!");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    console.error("User creation failed:", error);
    // Clean up uploaded files on failure
    if (avatar) {
      await deleteCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteCloudinary(coverImage.public_id);
    }
    throw new ApiError(500, "Something went wrong while registering user");
  }
});
export { registerUser };