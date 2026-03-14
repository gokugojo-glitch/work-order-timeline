const fs = require('fs');
const targetPath = './src/environments/environment.prod.ts';

// Get the variables from process.env (Vercel/Netlify/Local)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const envConfigFile = `export const environment = {
  production: true,
  supabase: {
    url: '${supabaseUrl}',
    anonKey: '${supabaseAnonKey}',
  },
};
`;

console.log('Generating environment.prod.ts with dynamic variables...');
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment file generated at ${targetPath}`);
