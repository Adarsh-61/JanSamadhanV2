'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';

export function useComplaints({ statusFilter = 'all', searchQuery = '' } = {}) {
    const [complaints, setComplaints] = useState([]);
    const [counts, setCounts] = useState({ total: 0, no_action: 0, working: 0, solved: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComplaints = useCallback(async () => {
        try {
            let query = supabase
                .from('complaints')
                .select('id, title, description, status, created_at, last_admin_note, attachments, visible')
                .eq('visible', true)
                .order('created_at', { ascending: false });

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (searchQuery) {
                const escaped = searchQuery.replace(/[\\%_]/g, c => '\\' + c);
                query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
            }

            const { data, error: err } = await query.limit(50);
            if (err) throw err;

            // Fetch exact counts bypassing limits
            const [totalRes, noActionRes, workingRes, solvedRes] = await Promise.all([
                supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('visible', true),
                supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('visible', true).eq('status', 'no_action'),
                supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('visible', true).eq('status', 'working'),
                supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('visible', true).eq('status', 'solved'),
            ]);

            setCounts({
                total: totalRes.count || 0,
                no_action: noActionRes.count || 0,
                working: workingRes.count || 0,
                solved: solvedRes.count || 0,
            });

            setComplaints(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('complaints-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'complaints',
                },
                () => {
                    fetchComplaints();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchComplaints]);

    return { complaints, counts, loading, error, refetch: fetchComplaints };
}
