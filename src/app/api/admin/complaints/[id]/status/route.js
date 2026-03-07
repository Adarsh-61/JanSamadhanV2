import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeText } from '@/lib/sanitize';

const VALID_STATUSES = ['no_action', 'working', 'solved'];

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;

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

        const body = await request.json();
        const newStatus = body.status;
        const adminNote = sanitizeText(body.admin_note || '', 2000);

        if (!VALID_STATUSES.includes(newStatus)) {
            return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
        }

        if ((newStatus === 'working' || newStatus === 'solved') && adminNote.length === 0) {
            return NextResponse.json(
                { error: 'A note is required when updating status to In Progress or Resolved.' },
                { status: 400 }
            );
        }

        const { data: current, error: fetchErr } = await supabase
            .from('complaints')
            .select('status')
            .eq('id', id)
            .single();

        if (fetchErr || !current) {
            return NextResponse.json({ error: 'Complaint not found.' }, { status: 404 });
        }

        const oldStatus = current.status;

        const { data: updated, error: updateErr } = await supabase
            .from('complaints')
            .update({
                status: newStatus,
                last_admin_note: adminNote || null,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateErr) {
            console.error('Update error:', updateErr);
            return NextResponse.json({ error: 'Failed to update complaint.' }, { status: 500 });
        }

        await supabase
            .from('complaint_history')
            .insert({
                complaint_id: id,
                action: oldStatus !== newStatus ? 'status_changed' : 'note_added',
                from_status: oldStatus,
                to_status: newStatus,
                note: adminNote || null,
                admin_id: user.id,
            });

        return NextResponse.json({ success: true, complaint: updated });
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
