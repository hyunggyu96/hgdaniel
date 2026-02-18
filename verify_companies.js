const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jwkdxygcpfdmavxcbcfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3a2R4eWdjcGZkbWF2eGNiY2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODQ2NjcsImV4cCI6MjA4MjA2MDY2N30.Aa-8BiFaFgumLNlYhz2T5ose4DKhD6duQDguZSMQypg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Success! Found', data.length, 'companies.');
        if (data.length > 0) console.log('Sample:', data[0].name_ko);
    }
}

check();
