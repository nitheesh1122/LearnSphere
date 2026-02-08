import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/auth';

// Allowed file types and max size (10MB for videos, 5MB for images)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Determine file type and size limits
        let maxSize: number;
        let allowedTypes: string[];
        
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            maxSize = MAX_IMAGE_SIZE;
            allowedTypes = ALLOWED_IMAGE_TYPES;
        } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
            maxSize = MAX_VIDEO_SIZE;
            allowedTypes = ALLOWED_VIDEO_TYPES;
        } else if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
            maxSize = MAX_DOCUMENT_SIZE;
            allowedTypes = ALLOWED_DOCUMENT_TYPES;
        } else {
            return NextResponse.json({ 
                error: `File type ${file.type} not allowed. Allowed types: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM, OGG), Documents (PDF)` 
            }, { status: 400 });
        }

        // Validate file size
        if (file.size > maxSize) {
            const sizeMB = Math.round(maxSize / (1024 * 1024));
            return NextResponse.json({ 
                error: `File too large. Max size is ${sizeMB}MB for ${file.type.startsWith('image/') ? 'images' : file.type.startsWith('video/') ? 'videos' : 'documents'}` 
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and generate unique filename
        const fileExtension = path.extname(file.name).toLowerCase();
        const sanitizedName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 50);
        const filename = `${uuidv4()}-${sanitizedName}${fileExtension}`;

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Directory exists, continue
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL with proper format
        const url = `/uploads/${filename}`;
        
        console.log(`File uploaded successfully: ${filename} (${file.size} bytes) by user ${session.user.id}`);
        
        return NextResponse.json({ 
            url,
            filename,
            size: file.size,
            type: file.type
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ 
            error: "Error uploading file. Please try again." 
        }, { status: 500 });
    }
}
