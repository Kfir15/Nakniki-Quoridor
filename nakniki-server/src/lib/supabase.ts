const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// get supabase url and key from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Anon Key in .env file");
}


// create the supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };