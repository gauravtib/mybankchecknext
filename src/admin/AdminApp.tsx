import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminUsers } from '../components/AdminUsers';
import { AdminAccounts } from '../components/AdminAccounts';
import { AdminSettings } from '../components/AdminSettings';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { PendingUploads } from '../components/PendingUploads';
import { AdminAnalytics } from '../components/AdminAnalytics';
import { SupabaseConnectionStatus } from '../components/SupabaseConnectionStatus';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    console.log('Has Supabase config:', hasSupabaseConfig);
    
    if (!hasSupabaseConfig) {
      // Demo mode - allow access without authentication
      console.log('No Supabase config, using demo mode');
      setIsAuthenticated(true);
      setCurrentUser({
        email: 'admin@mybankcheck.com',
        user_metadata: {
          first_name: 'Admin',
          last_name: 'User'
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Failed to get Supabase client');
        setIsLoading(false);
        setShowConnectionStatus(true);
        setAuthError('Failed to initialize Supabase client. Check your configuration.');
        return;
      }

      console.log('Getting session from Supabase...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        setIsLoading(false);
        setShowConnectionStatus(true);
        setAuthError(`Authentication error: ${error.message}`);
        return;
      }

      console.log('Session result:', session ? 'Found session' : 'No session');
      
      if (session?.user) {
        // Check if user is admin
        const adminEmails = [
          'admin@mybankcheck.com',
          'support@mybankcheck.com',
          'dev@mybankcheck.com'
        ];

        console.log('User email:', session.user.email);
        console.log('Is admin:', adminEmails.includes(session.user.email || ''));

        if (adminEmails.includes(session.user.email || '')) {
          setIsAuthenticated(true);
          setCurrentUser(session.user);
        } else {
          setAuthError('Access denied. Only admin users can access this panel.');
          setShowConnectionStatus(true);
        }
      } else {
        setAuthError('No active session. Please sign in.');
        setShowConnectionStatus(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowConnectionStatus(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    
    if (!hasSupabaseConfig) {
      // Demo mode login
      if (email === 'admin@mybankcheck.com') {
        setIsAuthenticated(true);
        setCurrentUser({
          email: 'admin@mybankcheck.com',
          user_metadata: {
            first_name: 'Admin',
            last_name: 'User'
          }
        });
        return;
      }
      throw new Error('Invalid credentials');
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    if (data.user) {
      const adminEmails = [
        'admin@mybankcheck.com',
        'support@mybankcheck.com',
        'dev@mybankcheck.com'
      ];

      if (adminEmails.includes(data.user.email || '')) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
      } else {
        throw new Error('Access denied. Admin privileges required.');
      }
    }
  };

  const handleLogout = async () => {
    if (hasSupabaseConfig) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'accounts':
        return <AdminAccounts />;
      case 'settings':
        return <AdminSettings />;
      case 'pending-uploads':
        return <PendingUploads />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return <AdminDashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin onLogin={handleLogin} authError={authError} />
        {showConnectionStatus && (
          <div className="fixed bottom-4 right-4 w-96">
            <SupabaseConnectionStatus />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader 
          currentUser={currentUser} 
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {showConnectionStatus && <div className="mb-6"><SupabaseConnectionStatus /></div>}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}