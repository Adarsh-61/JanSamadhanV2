import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
        const rateLimitResult = rateLimit(ip);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Try again in ${rateLimitResult.resetIn} seconds.` },
                { status: 429 }
            );
        }

        // Validate UUID format to prevent injection
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(id)) {
            return NextResponse.json({ error: 'Invalid complaint ID.' }, { status: 400 });
        }

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
        }

        const supabase = createServerClient();
        const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!adminData) {
            return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
        }

        const { error: deleteErr } = await supabase
            .from('complaints')
            .delete()
            .eq('id', id);

        if (deleteErr) {
            console.error('Delete error:', deleteErr);
            return NextResponse.json({ error: 'Failed to delete complaint.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
