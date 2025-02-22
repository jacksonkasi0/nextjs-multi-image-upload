'use client';

import React, { useState } from "react"

import { Button } from "@/components/ui/button"

import { MultiImageUpload } from "@/components/multi-image-upload"

const ImageUploadForm = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with images:", uploadedImages)
    // Perform any further actions, e.g., send images to backend
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Upload Your Images</h2>

      <MultiImageUpload
        onChange={setUploadedImages}
        maxImages={5}
        minImages={1}
        className="my-4"
      />

      <Button type="submit" variant="default" disabled={uploadedImages.length === 0}>
        Submit
      </Button>
    </form>
  )
}

export default ImageUploadForm
