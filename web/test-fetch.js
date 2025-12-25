
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("Fetching from:", supabaseUrl);
    const { data, error } = await supabase
        .from('articles')
        .select('title, published_at')
        .order('published_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Latest 5 articles:");
        data.forEach(d => console.log(`[${d.published_at}] ${d.title}`));
    }
}

testFetch();
