const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wsqgtpzhtzajbxsbpbbl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcWd0cHpodHphamJ4c2JwYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODE3MTksImV4cCI6MjA4ODQ1NzcxOX0.HGA2HzlBidRwFdLNjRk24eTM53YXjTK2pD65isxp91A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Admin Login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'pandeyadarsh3115@gmail.com',
        password: '#_+MpuLYC%sME9C'
    });

    if (authError) {
        console.error('❌ Auth Error:', authError.message);
    } else {
        console.log('✅ Auth Success. UID:', authData.user?.id);

        // Test fetching admin_users
        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('admin_id', authData.user.id);

        if (adminError) console.error('❌ Admin Fetch Error:', adminError.message);
        else console.log('✅ Admin Data:', adminData);
    }

    console.log('\nTesting Complaint Submission (RLS check)...');
    const { data: insertData, error: insertError } = await supabase
        .from('complaints')
        .insert({
            title: 'Test Title',
            description: 'This is a test description from the Node script',
            status: 'no_action',
            visible: true
        })
        .select();

    if (insertError) {
        console.error('❌ Insert Error:', insertError.message);
        console.error('Hint:', insertError.hint);
        console.error('Details:', insertError.details);
    } else {
        console.log('✅ Insert Success!', insertData);
    }
}

testConnection();
