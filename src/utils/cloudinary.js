import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs';
import dotenv from "dotenv"

dotenv.config()
//Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });


    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath) return null
                cloudinary.uploader.upload(
                    localFilePath,{
                        resource_type: "auto"
                    }
                )
                console.log("File uploaded on cloudinary file src : "+response.url)
                fs.unlinkSync(localFilePath)
                return response
        }catch(error){
            console.log("Error on cloudinary",error)
            fs.unlinkSync(localFilePath)
            return null
        }
    }

    const deleteCloudinary = async (publicId) =>{
        try{
            const result = cloudinary.uploader.destroy(publicId)
            console.log("deleted")

        }catch(error){
            console.log("Error deleting from cloudinary ",error)
        }
    }
    export {uploadOnCloudinary}
    export{deleteCloudinary}