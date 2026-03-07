'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

export function useComplaintHistory(complaintId) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!complaintId) return;

        async function fetch() {
            const { data, error } = await supabase
                .from('complaint_history')
                .select('*')
                .eq('complaint_id', complaintId)
                .order('created_at', { ascending: false });

            if (!error) setHistory(data || []);
            setLoading(false);
        }

        fetch();

        // Realtime subscription for history
        const channel = supabase
            .channel(`history-${complaintId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'complaint_history',
                    filter: `complaint_id=eq.${complaintId}`,
                },
                (payload) => {
                    setHistory(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [complaintId]);

    return { history, loading };
}
