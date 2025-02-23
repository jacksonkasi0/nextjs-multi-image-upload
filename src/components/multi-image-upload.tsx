"use client";
import React, { useCallback, useEffect, useRef } from "react";
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
  value?: string[];
  onChange?: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  url: string;
  deleteUrl: string;
  progress: number;
  fileType: string;
  isUploading: boolean;
  isDeleting: boolean;
}

// --- Reusable Preview Component ---
export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onDelete?: () => void;
  isUploading?: boolean;
  progress?: number;
  fileType: string;
  isDeleting?: boolean;
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
      {onDelete && !isUploading && !isDeleting && (
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

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  maxImages,
  className,
}) => {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const prevValueRef = useRef<string[]>(value);
  const isControlled = value !== undefined && onChange !== undefined;

  // Sync internal files with the incoming value prop
  useEffect(() => {
    if (!isControlled) return;

    const valueChanged =
      JSON.stringify(value) !== JSON.stringify(prevValueRef.current);
    if (valueChanged) {
      // Clean up previous blob URLs
      setFiles((prev) => {
        prev.forEach((file) => {
          if (file.isUploading && file.url.startsWith("blob:")) {
            URL.revokeObjectURL(file.url);
          }
        });

        const newFiles = value.map((url, index) => ({
          id: `${index}-${Date.now()}`,
          url,
          deleteUrl: url,
          progress: 100,
          fileType: url.match(/\.(jpeg|jpg|png|gif)$/i)
            ? "image/jpeg"
            : "application/octet-stream",
          isUploading: false,
          isDeleting: false,
        }));

        prevValueRef.current = value;
        return newFiles;
      });
    }
  }, [value, isControlled]);

  // Sync files with parent component after files change
  useEffect(() => {
    if (isControlled) {
      const fileUrls = files.map((f) => f.url);
      const currentValue = prevValueRef.current;
      if (JSON.stringify(fileUrls) !== JSON.stringify(currentValue)) {
        onChange?.(fileUrls);
        prevValueRef.current = fileUrls; // Update ref to avoid redundant calls
      }
    }
  }, [files, isControlled, onChange]);

  const handleUpload = useCallback(
    (filesList: FileList) => {
      const fileArray = Array.from(filesList);
      if (maxImages && files.length + fileArray.length > maxImages) {
        console.warn(`Maximum of ${maxImages} images allowed`);
        fileArray.splice(maxImages - files.length);
      }

      const newFiles = fileArray.map((file) => {
        const id = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage
          ? URL.createObjectURL(file)
          : "/file-icon-placeholder.png";

        return {
          id,
          url: previewUrl,
          deleteUrl: "",
          progress: 0,
          fileType: file.type,
          isUploading: true,
          isDeleting: false,
        };
      });

      setFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((newFile, index) => {
        const file = fileArray[index];
        const uploadFileAsync = async () => {
          try {
            const { uploadUrl } = await generateSignedUrl(file.name, file.type);
            await uploadFileToSignedUrl(file, uploadUrl, (progress) => {
              setFiles((prevFiles) =>
                prevFiles.map((f) =>
                  f.id === newFile.id ? { ...f, progress } : f
                )
              );
            });
            const publicUrl = uploadUrl.split("?")[0];
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === newFile.id
                  ? {
                      ...f,
                      url: publicUrl,
                      deleteUrl: publicUrl,
                      isUploading: false,
                      progress: 100,
                    }
                  : f
              )
            );
          } catch (error) {
            console.error("Upload failed for file", file.name, error);
            setFiles((prevFiles) =>
              prevFiles.filter((f) => f.id !== newFile.id)
            );
          } finally {
            if (newFile.url.startsWith("blob:")) {
              URL.revokeObjectURL(newFile.url);
            }
          }
        };
        uploadFileAsync();
      });
    },
    [files.length, maxImages]
  );

  const handleDeleteImage = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const fileToDelete = prev.find((f) => f.id === id);
        if (!fileToDelete || fileToDelete.isDeleting) return prev;
        return prev.map((f) => (f.id === id ? { ...f, isDeleting: true } : f));
      });

      const fileToDelete = files.find((f) => f.id === id);
      if (!fileToDelete) return;

      deleteFile(fileToDelete.deleteUrl)
        .then(() => {
          setFiles((prev) => prev.filter((f) => f.id !== id));
        })
        .catch((error) => {
          console.error("Failed to delete file", error);
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isDeleting: false } : f))
          );
        });
    },
    [files]
  );

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);

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
                  if (e.target.files?.length) {
                    handleUpload(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </Button>
        )}
        {files.map((file) => (
          <ImagePreview
            key={file.id}
            src={file.url}
            alt={`File ${file.id}`}
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
