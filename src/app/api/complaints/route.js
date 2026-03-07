import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText, sanitizeAttachments } from '@/lib/sanitize';

export async function POST(request) {
    try {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
        const rateLimitResult = rateLimit(ip);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.` },
                { status: 429 }
            );
        }

        const body = await request.json();
        const title = sanitizeText(body.title || '', 200);
        const description = sanitizeText(body.description || '', 5000);
        const attachments = sanitizeAttachments(body.attachments);

        if (description.length < 6) {
            return NextResponse.json(
                { error: 'Description must be at least 6 characters.' },
                { status: 400 }
            );
        }

        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        if (recaptchaSecret && body.recaptchaToken) {
            try {
                const recaptchaRes = await fetch(
                    `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(body.recaptchaToken)}`,
                    { method: 'POST' }
                );
                const recaptchaData = await recaptchaRes.json();
                if (!recaptchaData.success || recaptchaData.score < 0.3) {
                    return NextResponse.json(
                        { error: 'Verification failed. Please try again.' },
                        { status: 403 }
                    );
                }
            } catch {
                // If reCAPTCHA service is down, allow submission
            }
        }

        const supabase = createServerClient();
        const { data, error } = await supabase
            .from('complaints')
            .insert({
                title: title || null,
                description,
                attachments,
                status: 'no_action',
                last_admin_note: null,
                visible: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json(
                { error: 'Failed to submit complaint. Please try again.' },
                { status: 500 }
            );
        }

        await supabase
            .from('complaint_history')
            .insert({
                complaint_id: data.id,
                action: 'created',
                from_status: null,
                to_status: 'no_action',
                note: null,
                admin_id: null,
            });

        return NextResponse.json({ success: true, complaint: data }, { status: 201 });
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
