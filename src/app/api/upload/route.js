import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILES = 3;

export async function POST(request) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
        const rateLimitResult = rateLimit(ip);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Try again in ${rateLimitResult.resetIn} seconds.` },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed.` }, { status: 400 });
        }

        const supabase = createServerClient();
        const uploaded = [];

        for (const file of files) {
            if (!(file instanceof File)) continue;

            if (!ALLOWED_TYPES.includes(file.type)) {
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                continue;
            }

            const ext = file.name.split('.').pop() || 'bin';
            const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const { data, error } = await supabase.storage
                .from('attachments')
                .upload(safeName, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (error) {
                console.error('Storage upload error:', error);
                continue;
            }

            const { data: urlData } = supabase.storage
                .from('attachments')
                .getPublicUrl(data.path);

            uploaded.push({
                url: urlData.publicUrl,
                name: file.name.slice(0, 200),
                type: file.type,
            });
        }

        return NextResponse.json({ success: true, attachments: uploaded });
    } catch (err) {
        console.error('Upload API error:', err);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
