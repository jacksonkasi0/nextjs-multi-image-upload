"use client";
import React, { useCallback } from "react";
import { X, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  generateSignedUrl,
  uploadFileToSignedUrl,
  deleteFile,
} from "@/api/upload-api";

// --- Types ---
export interface MultiImageUploadProps {
  value?: string[]; // Controlled value from react-hook-form
  onChange?: (images: string[]) => void; // Callback to update form value
  maxImages?: number; // Optional limit on number of images
  className?: string;
}

interface UploadedFile {
  id: string;
  url: string;
  deleteUrl: string;
  progress: number;
  fileType: string;
  isUploading: boolean;
  isDeleting?: boolean; // New flag to track deletion state
}

// --- Reusable Preview Component ---
export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onDelete?: () => void;
  isUploading?: boolean;
  progress?: number;
  fileType: string;
  isDeleting?: boolean; // New prop for deletion animation
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "File preview",
  onDelete,
  isUploading = false,
  progress = 0,
  fileType,
  isDeleting = false,
}) => {
  const isImage = fileType.startsWith("image/");
  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md transition-all duration-600 ease-in-out",
        isDeleting && "animate-glow-effect"
      )}
    >
      {isImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-md transition-opacity duration-500 ease-in-out"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
          <File className="h-8 w-8 text-gray-500 sm:h-10 sm:w-10" />
        </div>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
          <span className="text-white text-xs sm:text-sm">{progress}%</span>
        </div>
      )}
      {onDelete && !isDeleting && (
        <button
          onClick={onDelete}
          className="absolute right-1 top-1 rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300 focus:outline-none"
          aria-label="Remove file"
          type="button"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  );
};

// --- Core Component ---
export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  maxImages,
  className,
}) => {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  // Sync internal state with external value
  React.useEffect(() => {
    setFiles((prev) =>
      value.map((url, index) => ({
        id: prev[index]?.id || `${index}-${Date.now()}`,
        url,
        deleteUrl: url,
        progress: 100,
        fileType: prev[index]?.fileType || "image/jpeg",
        isUploading: false,
        isDeleting: false,
      }))
    );
  }, [value]);

  const handleUpload = useCallback(
    (filesList: FileList) => {
      const fileArray = Array.from(filesList);
      fileArray.forEach((file) => {
        if (maxImages && files.length >= maxImages) return;

        const id =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const isImage = file.type.startsWith("image/");
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
          isDeleting: false,
        };

        setFiles((prev) => {
          const updated = [...prev, newFile];
          onChange?.(updated.map((f) => f.url));
          return updated;
        });

        (async () => {
          try {
            const { uploadUrl } = await generateSignedUrl(file.name, file.type);
            await uploadFileToSignedUrl(file, uploadUrl, (progress) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress } : f))
              );
            });
            const publicUrl = uploadUrl.split("?")[0];
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
            setFiles((prev) => {
              const updated = prev.filter((f) => f.id !== id);
              onChange?.(updated.map((f) => f.url));
              return updated;
            });
          }
        })();
      });
    },
    [files.length, maxImages, onChange]
  );

  const handleDeleteImage = useCallback(
    (id: string) => {
      const fileToDelete = files.find((f) => f.id === id);
      if (!fileToDelete) return;

      // Set isDeleting to true to trigger animation
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, isDeleting: true } : f
        )
      );

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
          // Reset isDeleting on error
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, isDeleting: false } : f
            )
          );
        });
    },
    [files, onChange]
  );

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex flex-wrap gap-4">
        {(maxImages === undefined || files.length < maxImages) && (
          <Button
            variant="outline"
            className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0"
            asChild
          >
            <label className="flex h-full w-full cursor-pointer items-center justify-center text-sm sm:text-base">
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
            isDeleting={file.isDeleting}
            onDelete={() => handleDeleteImage(file.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MultiImageUpload;