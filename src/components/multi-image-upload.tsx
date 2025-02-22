"use client";
import React, { useCallback, useEffect, useState } from "react";
import { X, File } from "lucide-react";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  generateSignedUrl,
  uploadFileToSignedUrl,
  deleteFile,
} from "@/api/upload-api";

// --- Types and Schema ---
export interface MultiImageUploadProps {
  onChange?: (images: string[]) => void;
  maxImages?: number; // if undefined, unlimited images allowed
  minImages?: number;
  className?: string;
}

// Zod schema for validating image URL array length.
export const ImagesSchema = (min: number, max?: number) => {
  const base = z
    .array(z.string().url({ message: "Invalid image URL" }))
    .min(min, { message: `At least ${min} image(s) required` });
  return max
    ? base.max(max, { message: `At most ${max} image(s) allowed` })
    : base;
};

// --- Internal File Type ---
interface UploadedFile {
  id: string;
  url: string;
  deleteUrl: string;
  progress: number;
  fileType: string;
  isUploading: boolean;
}

// --- Reusable Preview Component ---
export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onDelete?: () => void;
  isUploading?: boolean;
  progress?: number;
  fileType: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "File preview",
  onDelete,
  isUploading = false,
  progress = 0,
  fileType,
}) => {
  const isImage = fileType.startsWith("image/");
  return (
    <div className="relative">
      {isImage ? (
        <img
          src={src}
          alt={alt}
          className="h-24 w-24 rounded-md object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-24 w-24 flex items-center justify-center bg-gray-100 rounded-md">
          <File className="h-10 w-10 text-gray-500" />
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <span className="text-white text-sm">{progress}%</span>
        </div>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute right-1 top-1 rounded-full bg-secondary p-1 text-secondary-foreground hover:bg-secondary/80 focus:outline-none"
          aria-label="Remove file"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// --- Core Component ---
export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  onChange,
  maxImages,
  minImages = 0,
  className,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [validationMsg, setValidationMsg] = useState<string>("");

  // Validate file URLs using useEffect to avoid state updates during render.
  useEffect(() => {
    const result = ImagesSchema(minImages, maxImages).safeParse(
      files.map((f) => f.url)
    );
    setValidationMsg(
      result.success ? "" : result.error.issues[0]?.message || ""
    );
  }, [files, minImages, maxImages]);

  // Handle file uploads in parallel.
  const handleUpload = useCallback(
    (filesList: FileList) => {
      const fileArray = Array.from(filesList);
      fileArray.forEach((file) => {
        // If maxImages is defined and reached, skip adding new files.
        setFiles((prev) =>
          maxImages && prev.length >= maxImages ? prev : prev
        );

        // Generate a unique id for this file.
        const id =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const isImage = file.type.startsWith("image/");
        // For images, create a temporary local preview.
        const previewUrl = isImage
          ? URL.createObjectURL(file)
          : "/file-icon-placeholder.png";
        const newFile: UploadedFile = {
          id,
          url: previewUrl,
          deleteUrl: "",
          progress: 0,
          fileType: file.type,
          isUploading: true,
        };

        // Add the file record.
        setFiles((prev) => {
          const updated = [...prev, newFile];
          onChange?.(updated.map((f) => f.url));
          return updated;
        });

        // Start the upload process.
        (async () => {
          try {
            // 1. Get the signed URL.
            const { uploadUrl } = await generateSignedUrl(file.name, file.type);
            // 2. Upload the file with progress tracking.
            await uploadFileToSignedUrl(file, uploadUrl, (progress) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress } : f))
              );
            });
            // Derive the public URL by stripping query parameters.
            const publicUrl = uploadUrl.split("?")[0];
            // Update the file record. Use the public URL as both the display URL and delete URL.
            setFiles((prev) => {
              const updated = prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      url: publicUrl!,
                      deleteUrl: publicUrl!,
                      isUploading: false,
                      progress: 100,
                    }
                  : f
              );
              onChange?.(updated.map((f) => f.url));
              return updated;
            });
          } catch (error) {
            console.error("Upload failed for file", file.name, error);
            // Remove the file if upload fails.
            setFiles((prev) => {
              const updated = prev.filter((f) => f.id !== id);
              onChange?.(updated.map((f) => f.url));
              return updated;
            });
          }
        })();
      });
    },
    [maxImages, onChange]
  );

  // Handle deletion: call the API then remove the file from state.
  const handleDeleteImage = useCallback(
    (id: string) => {
      const fileToDelete = files.find((f) => f.id === id);
      if (!fileToDelete) return;
      deleteFile(fileToDelete.deleteUrl)
        .then(() => {
          setFiles((prev) => {
            const updated = prev.filter((f) => f.id !== id);
            onChange?.(updated.map((f) => f.url));
            return updated;
          });
        })
        .catch((error) => {
          console.error("Failed to delete file", error);
        });
    },
    [files, onChange]
  );

  return (
    <section className={cn("flex flex-col max-w-lg", className)}>
      <div className="grid grid-cols-5 gap-3">
        {(maxImages === undefined || files.length < maxImages) && (
          <Button variant="outline" className="h-24 w-24" asChild>
            <label className="flex h-full! w-full! cursor-pointer items-center justify-center">
              Browse
              <input
                type="file"
                accept="*/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </Button>
        )}
        {files.map((file, index) => (
          <ImagePreview
            key={file.id}
            src={file.url}
            alt={`File ${index + 1}`}
            fileType={file.fileType}
            isUploading={file.isUploading}
            progress={file.progress}
            onDelete={() => handleDeleteImage(file.id)}
          />
        ))}
      </div>
      {validationMsg && (
        <p className="mt-2 text-sm text-destructive">{validationMsg}</p>
      )}
    </section>
  );
};

export default MultiImageUpload;
