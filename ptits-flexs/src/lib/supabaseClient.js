import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txoopywzhrbnyaarzydg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b29weXd6aHJibnlhYXJ6eWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDUyMzYsImV4cCI6MjA2MzQyMTIzNn0.zbtpy2wbJbITVCR8vzRSL-gXyZrir9H1K26oeVjamKA';

export const supabase = createClient(supabaseUrl, supabaseKey);