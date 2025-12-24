const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
    console.log('Checking user_collections table...');
    const { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from user_collections:', error.message);
        if (error.code === '42P01') {
            console.log('Table "user_collections" does not exist. Creating it (if possible)...');
            // Supabase JS client cannot create tables. 
            // I will notify the user if it's missing.
        }
    } else {
        console.log('user_collections table exists and is accessible.');
    }
}

checkTable();
