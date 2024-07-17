import { ref, uploadBytes, getDownloadURL, UploadTaskSnapshot, uploadBytesResumable } from "firebase/storage";
import { storage } from "../lib/firebase";
import { Context } from "hono";
import { FirebaseError } from "firebase/app";
import { handleError } from "../middleware/handleError";

export const uploadImage = async (c: Context) => {
    try {
        const userId = c.req.user?.userId;
        if (!userId) {
            return c.json({ error: 'User not authenticated' }, 401);
        }
        const body = await c.req.parseBody()
        const file = body['file']
        if (!(file instanceof File)) {
            return c.json({ error: 'No valid file uploaded' }, 400);
        }
        const buffer = await file.arrayBuffer();
        const fileName = `${userId}_${file.name}`;
        const storageRef = ref(storage, `images/${fileName}`);
        const snapshot = await uploadBytes(storageRef, buffer);
        const url = await getDownloadURL(snapshot.ref);

        return c.json({ url });
    } catch (error: any) {
        return handleError(c, error)
    }
};


// buat di client saja yang ini

export const uploadImageTwo = async (c: Context) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];
        
        if (!(file instanceof File)) {
            return c.json({ error: 'No valid file uploaded' }, 400);
        }
        
        const buffer = await file.arrayBuffer();
        const storageRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, new Uint8Array(buffer));

        uploadTask.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                console.log(`Upload is ${progress}% done`);
            },
            (error: FirebaseError) => {
                console.error('Upload failed:', error);
                return c.json({ error: 'Failed to upload file' }, 500);
            },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                return c.json({ url });
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return c.json({ error: 'Failed to upload file' }, 500);
    }
};