import { createClient, SupabaseClient } from '@supabase/supabase-js';

// More robust environment variable checking
const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value || 
      value.startsWith('${') || 
      value === `your_${name.toLowerCase().replace('vite_', '')}_here` ||
      value === 'https://demo.supabase.co' ||
      value === 'pk_test_demo' ||
      value.includes('Your_') ||
      value.includes('_Here')) {
    console.warn(`Invalid environment variable: ${name}`);
    return '';
  }
  return value;
};

// Check if Supabase environment variables are available and valid
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Log Supabase configuration status
console.log('Supabase Configuration:');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not set or invalid');
console.log('Key:', supabaseKey ? 'Set (valid format)' : 'Not set or invalid');

// More thorough validation of Supabase configuration
export const hasSupabaseConfig = supabaseUrl && 
                                 supabaseKey && 
                                 supabaseUrl.startsWith('https://') && 
                                 supabaseKey.startsWith('eyJ') &&
                                 !supabaseUrl.includes('demo') &&
                                 supabaseKey.length > 100; // Valid JWT tokens are much longer

console.log('Supabase configuration valid:', hasSupabaseConfig);

// Singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!hasSupabaseConfig) {
    console.warn('Supabase not configured properly - running in demo mode');
    return null;
  }

  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client created successfully');
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }

  return supabaseInstance;
};

// Reset the singleton (useful for testing or when switching environments)
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

// Helper function to test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    console.log('Testing Supabase connection...');
    const { error } = await client.auth.getSession();
    const isConnected = !error;
    console.log('Supabase connection test result:', isConnected ? 'Connected' : 'Failed', error ? `(Error: ${error.message})` : '');
    return isConnected;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};