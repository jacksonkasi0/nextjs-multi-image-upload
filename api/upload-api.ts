import axios from "axios";

// Define expected types for API responses
type SignedUrlResponse = { uploadUrl: string };
type UploadProgressCallback = (percent: number) => void;

/**
 * Generates a signed URL for uploading a file.
 *
 * @param fileName - The name of the file to be uploaded.
 * @param contentType - The MIME type of the file.
 * @returns A promise that resolves with an object containing the upload URL.
 */
export async function generateSignedUrl(
  fileName: string,
  contentType: string
): Promise<SignedUrlResponse> {
  try {
    const response = await axios.post<SignedUrlResponse>("/api/s3/signed-url", {
      fileName,
      contentType,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Error generating signed URL: ${error.response.data.error}`
      );
    }
    throw new Error(`Error generating signed URL: ${error}`);
  }
}

/**
 * Uploads a file using the provided signed URL and reports progress.
 *
 * @param file - The file to be uploaded.
 * @param signedUrl - The signed URL to upload the file to.
 * @param onProgress - Callback function to report the upload progress (percentage).
 * @returns A promise that resolves when the upload is complete.
 */

export async function uploadFileToSignedUrl(
  file: File,
  signedUrl: string,
  onProgress: (percent: number) => void
): Promise<void> {
  try {
    await axios.put(signedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      // Disable request transformation so the File/Blob is sent as-is.
      transformRequest: [(data) => data],
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error response data:", error.response.data);
      throw new Error(
        `Error uploading file: ${error.response.data.error || "Unknown error"}`
      );
    }
    throw new Error(`Error uploading file: ${error}`);
  }
}

/**
 * Deletes a file using the internal API path.
 *
 * @param fileUrl - The URL of the file to be deleted.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    await axios.delete("/api/s3/delete", {
      data: { fileUrl },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error deleting file: ${error.response.data.error}`);
    }
    throw new Error(`Error deleting file: ${error}`);
  }
}
