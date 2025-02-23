"use client";

// ** Import React and Core Libraries
import React from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";

// ** Import Third Party Libraries
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ** Import UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ** Import Custom Components
import { MultiImageUpload } from "@/components/multi-image-upload";
import Background from "@/components/background";

// Define the form schema
const schema = z.object({
  images: z
    .array(z.string().url({ message: "Invalid image URL" }))
    .min(1, { message: "At least 1 image is required" })
    .max(5, { message: "Maximum 5 images allowed" }),
});

// Define the form data type
type FormData = z.infer<typeof schema>;

const ImageUploadForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { images: [] },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with images:", data.images);
    // Perform any further actions, e.g., send images to backend
  };

  return (
    <Background>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-lg"
          >
            <FormField
              control={form.control}
              name="images"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormData, "images">;
              }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    Upload your images or files (up to 5)
                  </FormLabel>
                  <FormControl>
                    <MultiImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxImages={5}
                      className="my-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="default"
              className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </Background>
  );
};

export default ImageUploadForm;
