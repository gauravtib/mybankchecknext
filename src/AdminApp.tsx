import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUsers } from './components/AdminUsers';
import { AdminAccounts } from './components/AdminAccounts';
import { AdminSettings } from './components/AdminSettings';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { PendingUploads } from './components/PendingUploads';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (!hasSupabaseConfig) {
      // Demo mode - allow access without authentication
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
        setIsLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        // Check if user is admin
        const adminEmails = [
          'admin@mybankcheck.com',
          'support@mybankcheck.com',
          'dev@mybankcheck.com'
        ];

        if (adminEmails.includes(session.user.email || '')) {
          setIsAuthenticated(true);
          setCurrentUser(session.user);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
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
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
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
    return <AdminLogin onLogin={handleLogin} />;
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}