"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MultiImageUpload } from "@/components/multi-image-upload";
import Background from "@/components/background";

const ImageUploadForm = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with images:", uploadedImages);
    // Perform any further actions, e.g., send images to backend
  };

  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg">
          <h2 className="text-lg font-medium text-gray-900">
            Upload Your Images
          </h2>
          <MultiImageUpload
            onChange={setUploadedImages}
            maxImages={5}
            minImages={1}
            className="my-4"
          />
          <Button
            type="submit"
            variant="default"
            disabled={uploadedImages.length === 0}
            className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Submit
          </Button>
        </form>
      </div>
    </Background>
  );
};

export default ImageUploadForm;