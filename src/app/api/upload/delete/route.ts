import { NextResponse } from "next/server";

// ** Import 3rd party library
import { z } from "zod";

// ** Import helper
import { deleteFileFromS3, extractKeyFromUrl } from "@/helpers/upload";

// Define the input schema using Zod
const deleteFileSchema = z.object({
  fileUrl: z.string().url().optional(),
  key: z.string().min(1, "key is required").optional(),
});

// Define the expected TypeScript type for the input
type DeleteFileInput = z.infer<typeof deleteFileSchema>;

export async function DELETE(req: Request) {
  try {
    const json = await req.json();

    // Validate the input using Zod
    const parsedData = deleteFileSchema.safeParse(json);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { fileUrl, key } = parsedData.data as DeleteFileInput;

    let s3Key = key;
    if (!s3Key && fileUrl) {
      s3Key = extractKeyFromUrl(fileUrl);
    }

    if (!s3Key) {
      return NextResponse.json(
        { error: "Missing fileUrl or key" },
        { status: 400 }
      );
    }

    await deleteFileFromS3(s3Key);
    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
