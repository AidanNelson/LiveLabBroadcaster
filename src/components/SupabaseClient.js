
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// async function printInfo() {
//     const { data, error } = await supabase
//         .storage
//         .listBuckets();
//     console.log(data, error);
// };

// printInfo();