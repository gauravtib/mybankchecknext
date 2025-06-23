import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { testSupabaseConnection, hasSupabaseConfig } from '../lib/supabase';

export function SupabaseConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [envVars, setEnvVars] = useState<{url: string, key: string}>({
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden for security)' : 'Not set'
  });

  const checkConnection = async () => {
    setStatus('checking');
    setErrorDetails(null);
    
    try {
      if (!hasSupabaseConfig) {
        setStatus('error');
        setErrorDetails('Supabase environment variables are not properly configured');
        return;
      }
      
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorDetails('Could not connect to Supabase. Check your configuration and network.');
      }
    } catch (error) {
      setStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    checkConnection();
  };

  if (status === 'checking') {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking Supabase connection...</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <span className="text-red-800 font-medium">Supabase Connection Error</span>
              {errorDetails && <p className="text-sm text-red-700 mt-1">{errorDetails}</p>}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>Check your .env file and make sure these variables are set correctly:</p>
          <ul className="list-disc list-inside mt-1">
            <li>VITE_SUPABASE_URL: {envVars.url || 'Not set'}</li>
            <li>VITE_SUPABASE_ANON_KEY: {envVars.key}</li>
          </ul>
          <p className="mt-2">Make sure you've created admin users in Supabase with these emails:</p>
          <ul className="list-disc list-inside mt-1">
            <li>admin@mybankcheck.com</li>
            <li>support@mybankcheck.com</li>
            <li>dev@mybankcheck.com</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Connected to Supabase</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}