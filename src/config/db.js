const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// In-memory fallback database used by current controllers
const db = {
  clients: [],
  comptes: [],
  transactions: [],
};

const uuidv4 = () => randomUUID();

module.exports = { db, uuidv4, supabase };

