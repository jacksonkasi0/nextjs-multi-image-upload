import { NextResponse } from "next/server";

// ** Import 3rd party library
import { z } from "zod";

// ** Import helper
import { getSignedUploadUrl } from "@/helpers/upload";

// Define the input schema using Zod
const signedUrlSchema = z.object({
  fileName: z.string().min(1, "fileName is required"),
  contentType: z.string().min(1, "contentType is required"),
});

// Define the expected TypeScript type for the input
type SignedUrlInput = z.infer<typeof signedUrlSchema>;

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // Validate the input against the Zod schema
    const parsedData = signedUrlSchema.safeParse(json);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.format() },
        { status: 400 }
      );
    }

    const { fileName, contentType } = parsedData.data as SignedUrlInput;

    // Generate the signed URL for uploading the file to S3.
    const uploadUrl = await getSignedUploadUrl(fileName, contentType);
    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
