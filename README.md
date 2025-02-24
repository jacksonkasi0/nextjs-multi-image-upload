
# Next.js Multi-Image Upload

A reusable, responsive multi-image upload component built with Next.js, TypeScript, Tailwind CSS, `shadcn/ui`, and `react-hook-form`. This project provides a simple, type-safe solution for uploading multiple images with progress tracking, deletion feedback, and form validation integration.

![Demo - Next.js Multi-Image Upload](/public/og-image.png)

## Features

- **Multi-Image Upload**: Upload multiple files with a configurable maximum limit (default: 5).
- **Responsive Design**: Flex-based layout that adapts to different screen sizes using Tailwind CSS.
- **Progress Tracking**: Displays upload progress as a percentage overlay on each image.
- **Deletion Feedback**: Glow-and-dim animation during image deletion to indicate the action is in progress.
- **Form Integration**: Fully compatible with `react-hook-form` for controlled form validation and error handling.
- **Type-Safe**: Written in TypeScript with proper type definitions for props and internal state.
- **Customizable**: Easily styled via Tailwind CSS classes and extensible through props.
- **API Support**: Integrates with signed URL generation and file upload/deletion APIs (server-side logic included).

## Demo

- <https://nextjs-multi-image-upload.vercel.app>

<div>
    <a href="https://www.loom.com/share/b7fc9d6650854953b108d17be81c1e2a">
      <p>Next.js Multi-Image Upload</p>
    </a>
    <a href="https://www.loom.com/share/b7fc9d6650854953b108d17be81c1e2a">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/b7fc9d6650854953b108d17be81c1e2a-7bf516d6b82ee20d-full-play.gif">
    </a>
  </div>

## Prerequisites

- Node.js (v18+ recommended)
- Bun (or npm/yarn/pnpm) as the package manager
- Next.js project with TypeScript configured
- Tailwind CSS installed
- `shadcn/ui` components (`button`, `form`, `label`) installed
- `react-hook-form` and `@hookform/resolvers/zod` for form validation
- `zod` for schema validation
- `lucide-react` for icons

## Installation

1. **Clone the Repository** (optional, if not copying files directly):

   ```bash
   git clone https://github.com/jacksonkasi0/nextjs-multi-image-upload.git
   cd nextjs-multi-image-upload
   ```

2. **Install Dependencies**:

   ```bash
   bun install
   ```

3. **Set Up Environment Variables**:

   - Copy `example.env` to `.env` and configure your API keys or endpoints (e.g., for signed URL generation).
   - Example `.env`:

     ```bash
        NODE_ENV="production"

        # S3
        AWS_ACCESS_KEY_ID="xxxxx" # your access key
        AWS_SECRET_ACCESS_KEY="xxxxxxx" # your secret key
        AWS_REGION="xxxxxx" # example: ap-south-1, us-east-1
        AWS_BUCKET_NAME="xxxxx" # your bucket name
     ```

    👀 **Check the [`Secure_S3_Bucket_Setup.md`](./Secure_S3_Bucket_Setup.md) guide for setting up a secure S3 bucket.** 🛡️

4. **Run the Development Server**:

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Integrating into Your Project

To use the `MultiImageUpload` component in your own Next.js project, follow these steps:

#### 1. Copy Required Files

Copy the following files from this repository into your project:

- **`src/components/multi-image-upload.tsx`**: The core component with upload and deletion logic.
- **`src/api/upload-api.ts`**: Client-side API functions for signed URL generation, uploading, and deletion.
- **`src/app/api/upload/signed-url/route.ts`**: Server-side route to generate signed URLs.
- **`src/app/api/upload/delete/route.ts`**: Server-side route to delete files.
- **`src/components/background.tsx`**: Optional background component for the radial gradient effect.

#### 2. Install Dependencies

Ensure your project has the required dependencies. Add them to your `package.json`:

```bash
bun add react-hook-form @hookform/resolvers/zod zod lucide-react
bun add -D tailwindcss postcss autoprefixer @types/react @types/node typescript
```

If you’re using `shadcn/ui`, initialize it and add the necessary components:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button form label
```

#### 3. Configure Tailwind CSS

To ensure the `MultiImageUpload` component works correctly with its glow-and-dim animation during deletion, you need to configure your `tailwind.config.ts` with the `shadcn/ui` color variables (e.g., `--muted`, `--primary`) and the custom `glow-effect` animation. Below is an example configuration:

```ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        # code...
      },
      borderRadius: {
        # code...
      },
      animation: {
        "glow-effect": "glow-effect 1.5s infinite ease-in-out",
      },
      keyframes: {
        "glow-effect": {
          "0%, 100%": {
            boxShadow:
              "0 0 10px var(--muted-foreground), 0 0 20px var(--muted)",
            opacity: "1",
          },
          "50%": {
            boxShadow:
              "0 0 20px var(--primary), 0 0 40px var(--primary-foreground)",
            opacity: "0.5",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**Important Notes:**

- **Animation**: The `glow-effect` animation is critical for the deletion feedback in `MultiImageUpload`. You **must** include the `animation` and `keyframes` definitions as shown above. The animation uses `box-shadow` and `opacity` to create a glowing and dimming effect, relying on `shadcn/ui` color variables (`--muted`, `--muted-foreground`, `--primary`, `--primary-foreground`).
- **Plugin**: Add the `tailwindcss-animate` plugin to enable custom animations. Install it with:

  ```bash
  bun add -D tailwindcss-animate
  ```

- **Colors**: Ensure your `shadcn/ui` setup defines the required CSS variables in `globals.css` or a similar stylesheet (e.g., via `:root { --muted: 210 40% 96.1%; }`). If not, replace the variables with specific HSL or hex values.

#### 4. Example Usage

Here’s how to use `MultiImageUpload` with `react-hook-form` in a page (e.g., `src/app/page.tsx`):

```tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiImageUpload } from "@/components/multi-image-upload";
import Background from "@/components/background";

const schema = z.object({
  images: z
    .array(z.string().url())
    .min(1, "At least 1 image is required")
    .max(5, "Maximum 5 images allowed"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { images: [] },
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitted:", data.images);
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
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
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </Background>
  );
}
```

#### 5. Set Up API Routes

- Place `signed-url/route.ts` and `delete/route.ts` in your `src/app/api/upload/` directory.
- Update the API logic in `upload-api.ts` to point to your backend (e.g., AWS S3, Cloudinary) if different from the example.

### Props for `MultiImageUpload`

| Prop        | Type                         | Default | Description                     |
| ----------- | ---------------------------- | ------- | ------------------------------- |
| `value`     | `string[]`                   | `[]`    | Controlled array of image URLs  |
| `onChange`  | `(images: string[]) => void` | -       | Callback to update the value    |
| `maxImages` | `number`                     | -       | Optional max number of images   |
| `className` | `string`                     | -       | Additional Tailwind CSS classes |

## File Structure

```
nextjs-multi-image-upload/
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── api/
│   │   └── upload-api.ts       # Client-side API functions
│   ├── app/
│   │   ├── api/upload/
│   │   │   ├── delete/route.ts # DELETE route for file removal
│   │   │   └── signed-url/route.ts # GET/POST route for signed URLs
│   │   ├── favicon.ico
│   │   ├── layout.tsx
│   │   └── page.tsx           # Example page using MultiImageUpload
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── form.tsx
│   │   │   └── label.tsx
│   │   ├── background.tsx     # Radial gradient background
│   │   └── multi-image-upload.tsx # Main component
│   ├── config/
│   │   └── env.ts             # Environment variable config
│   ├── helpers/
│   │   └── upload.ts          # Upload-related utilities
│   ├── lib/
│   │   └── utils.ts           # Utility functions (e.g., cn)
│   └── styles/
│       └── globals.css        # Global styles
├── .env                       # Environment variables
├── .gitignore
├── README.md
├── bun.lock                   # Bun lockfile
├── components.json            # shadcn/ui config
├── eslint.config.mjs
├── example.env
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Created by [jacksonkasi0](https://github.com/jacksonkasi0) & [jacksonkasi1](https://github.com/jacksonkasi1).
