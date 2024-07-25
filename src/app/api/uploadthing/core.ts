import getCurrentUser from "@/app/actions/getCurrentUser";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser();

      if (!user?.id || !user?.email)
        throw new UploadThingError("You must be logged in to upload files");

      return { userId: user.id };
    })
    .onUploadComplete(async ({}) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
