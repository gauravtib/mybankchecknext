import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Clock, AlertTriangle } from 'lucide-react';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: () => void;
  onBackToWebsite: () => void;
}

export function LoginForm({ onLogin, onSignUp, onBackToWebsite }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);

  // Rate limit countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (rateLimitCountdown && rateLimitCountdown > 0) {
      interval = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev && prev <= 1) {
            setError(null);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [rateLimitCountdown]);

  const parseRateLimitError = (errorMessage: string, errorCode?: string): number => {
    // Handle different rate limit error formats
    if (errorCode === 'over_email_send_rate_limit' || errorMessage.includes('over_email_send_rate_limit')) {
      // Extract seconds from error message like "you can only request this after 55 seconds"
      const match = errorMessage.match(/after (\d+) seconds/);
      return match ? parseInt(match[1], 10) : 60;
    }
    
    // Handle other rate limit patterns
    const timeMatch = errorMessage.match(/(\d+)\s*seconds?/i);
    if (timeMatch) {
      return parseInt(timeMatch[1], 10);
    }
    
    // Default fallback
    return 60;
  };

  const isRateLimitError = (error: any): boolean => {
    if (!error) return false;
    
    // Check status code
    if (error.status === 429) return true;
    
    // Check error code
    if (error.code === 'over_email_send_rate_limit') return true;
    
    // Check message content
    const message = error.message || '';
    return message.includes('rate_limit') || 
           message.includes('rate limit') ||
           message.includes('too many requests') ||
           message.includes('over_email_send_rate_limit') ||
           message.includes('security purposes');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRateLimitCountdown(null);
    
    try {
      if (!hasSupabaseConfig) {
        setError('Supabase configuration is required for authentication. Please check your environment variables.');
        setIsLoading(false);
        return;
      }

      console.log('LoginForm: Attempting login for:', email);
      await onLogin(email, password);
      console.log('LoginForm: Login successful');
      
    } catch (err: any) {
      console.error('LoginForm: Login error:', err);
      
      // Check if it's a rate limit error
      if (isRateLimitError(err)) {
        const waitTime = parseRateLimitError(err.message, err.code);
        setRateLimitCountdown(waitTime);
        setError(`Too many login attempts. Please wait ${waitTime} seconds before trying again.`);
      } else {
        // Handle specific error types
        if (err.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (err.message?.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isRateLimited = rateLimitCountdown !== null && rateLimitCountdown > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back to Website Button */}
        <div className="mb-6">
          <button
            onClick={onBackToWebsite}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Website</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg mb-6">
              {/* Bank verification icon */}
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield base */}
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                {/* Eye in center */}
                <ellipse cx="12" cy="11" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="11" r="1" fill="currentColor"/>
                {/* Scanning lines */}
                <path d="M8 8L16 8" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                <path d="M8 14L16 14" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                {/* Corner brackets */}
                <path d="M6 6L6 8L8 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 6L18 8L16 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M6 16L6 14L8 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 16L18 14L16 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
              </svg>
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
              MyBankCheck
            </h1>
            <p className="text-gray-600 font-medium">Bank Account Risk Checker</p>
            <p className="text-sm text-gray-500 mt-2">Sign in to access the risk checking dashboard</p>
          </div>

          {!hasSupabaseConfig && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Configuration Required:</strong> Supabase environment variables needed for authentication
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`border rounded-lg p-4 ${
                isRateLimited 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {isRateLimited ? (
                    <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isRateLimited ? 'text-orange-800' : 'text-red-800'
                    }`}>
                      {isRateLimited ? 'Rate Limited' : 'Sign In Error'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isRateLimited ? 'text-orange-700' : 'text-red-700'
                    }`}>
                      {error}
                    </p>
                    {isRateLimited && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-orange-200 rounded-full h-2">
                          <div
                            className="h-2 bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${Math.max(0, ((60 - (rateLimitCountdown || 0)) / 60) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-orange-700">
                          {rateLimitCountdown}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={isRateLimited}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isRateLimited}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isRateLimited}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !hasSupabaseConfig || isRateLimited}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : !hasSupabaseConfig ? (
                'Configure Supabase'
              ) : isRateLimited ? (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Wait {rateLimitCountdown}s
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSignUp}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={isRateLimited}
              >
                Sign up for free
              </button>
            </p>
          </div>

          {/* Rate Limit Information */}
          {isRateLimited && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Security Rate Limit Active</p>
                  <p className="mt-1">
                    For security, Supabase limits authentication requests to prevent automated attacks and protect user accounts. Please wait for the countdown to complete.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}