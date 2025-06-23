'use client';

import { useState, useEffect } from 'react';
import { AdminLogin } from '@/components/admin/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminUsers } from '@/components/AdminUsers';
import { AdminAccounts } from '@/components/AdminAccounts';
import { AdminSettings } from '@/components/AdminSettings';
import { AdminHeader } from '@/components/admin/components/AdminHeader';
import { AdminSidebar } from '@/components/admin/components/AdminSidebar';
import { PendingUploads } from '@/components/PendingUploads';
import { AdminAnalytics } from '@/components/AdminAnalytics';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    
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
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    
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
  };

  const handleLogout = async () => {
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
      <AdminLogin onLogin={handleLogin} authError={authError} />
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}