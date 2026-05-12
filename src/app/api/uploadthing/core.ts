import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

const f = createUploadthing();

export const ourFileRouter = {
  conresUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 4 },
    pdf: { maxFileSize: '16MB', maxFileCount: 4 },
    text: { maxFileSize: '2MB', maxFileCount: 4 },
    audio: { maxFileSize: '32MB', maxFileCount: 1 }
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await sql`
        insert into uploaded_files (clerk_user_id, name, url, key, size)
        values (${metadata.userId}, ${file.name}, ${file.url}, ${file.key}, ${file.size || null})
      `;
      return { uploadedBy: metadata.userId, url: file.url };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
