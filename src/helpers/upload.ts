
// ** Import Third Party Packages **
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  
  // ** Import Third Party Packages **
  import { nanoid } from "nanoid";
  

  // ** Import Configs **
  import { env } from "@/config/env";
  
  // Define root and subfolder names
  const rootFolder = "uploads";
  const subFolder = "images";
  
  // Assuming you've set these environment variables in your .env.local or equivalent
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  /**
   * Uploads a file to AWS S3 with a unique filename.
   *
   * @param file - The file to be uploaded as a Buffer.
   * @param fileName - The original file name (to retain the file extension).
   * @param contentType - The MIME type of the file.
   * @returns The public URL of the uploaded file.
   */
  export async function uploadFileToS3(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    // Extract the file extension (e.g., .png, .jpg)
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    
    // Generate a unique file name using nanoid
    const uniqueFileName = `${nanoid()}${fileExtension}`;
  
    // Build the complete S3 file path
    const filePath = `${rootFolder}/${subFolder}/${uniqueFileName}`;
  
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: filePath,
      Body: file,
      ContentType: contentType,
    });
  
    await s3Client.send(command);
  
    // Return the public URL of the uploaded file
    return `https://${env.AWS_BUCKET_NAME}.s3.amazonaws.com/${filePath}`;
  }
  
  /**
   * Extracts the S3 object key from the given URL.
   *
   * @param url - The full URL of the S3 object.
   * @returns The exact object key used in the S3 bucket.
   */
  export function extractKeyFromUrl(url: string): string {
    const bucketUrl = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/`;
    
    if (url.startsWith(bucketUrl)) {
      // Return only the relative path (S3 key) by stripping the bucket URL
      return url.replace(bucketUrl, "");
    }
    
    console.warn("URL does not match bucket pattern:", url);
    return url;
  }
  
  
  /**
   * Deletes a file from AWS S3.
   *
   * @param key - The key of the file to be deleted.
   */
  export async function deleteFileFromS3(key: string): Promise<void> {
    console.log("Deleting S3 file with key:", key); // Debugging log
  
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
    });
  
    try {
      await s3Client.send(command);
      console.log("File deleted successfully:", key);
    } catch (error) {
      console.error("Failed to delete file from S3:", error);
      throw error;
    }
  }
  
  /**
   * Generates a signed URL for uploading a file to AWS S3.
   *
   * @param fileName - The name to save the file as in S3.
   * @param contentType - The MIME type of the file.
   * @param expiresIn - (Optional) The number of seconds before the URL expires. Defaults to 3600 (1 hour).
   * @returns A signed URL that can be used for uploading the file.
   */
  export async function getSignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
      // Extract the file extension (e.g., .png, .jpg)
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    
      // Generate a unique file name using nanoid
      const uniqueFileName = `${nanoid()}${fileExtension}`;
      
      // Build the complete S3 file path
      const filePath = `${rootFolder}/${subFolder}/${uniqueFileName}`;
      
      const command = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: filePath,
      ContentType: contentType,
      // ACL: "public-read", // # checkout the s3 guide file.
    });
  
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  }
