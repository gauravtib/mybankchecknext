'use client';

import { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { LoginForm } from '@/components/LoginForm';
import { SignUpForm } from '@/components/SignUpForm';
import { Dashboard } from '@/components/Dashboard';
import { SuccessPage } from '@/components/SuccessPage';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'success'>('landing');
  const [userAccount, setUserAccount] = useState<any>(null);
  const [forceSignupMode, setForceSignupMode] = useState(false);

  const handleGetStarted = async () => {
    console.log('=== GET STARTED FUNCTION CALLED ===');
    setForceSignupMode(true);
    setUserAccount(null);
    setCurrentView('signup');
  };

  const handleSignIn = () => {
    console.log('=== SIGN IN FUNCTION CALLED ===');
    setForceSignupMode(false);
    setCurrentView('login');
  };

  const handleBackToWebsite = () => {
    console.log('=== BACK TO WEBSITE CALLED ===');
    setForceSignupMode(false);
    setUserAccount(null);
    setCurrentView('landing');
  };

  const handleLogin = async (email: string, password: string) => {
    console.log('=== LOGIN HANDLER CALLED ===');
    console.log('Email:', email);
    
    // Demo mode - go directly to dashboard
    handleGetStarted();
  };

  const handleSignUp = (userData: any) => {
    console.log('=== SIGNUP HANDLER CALLED ===');
    console.log('User data:', userData);
    
    // Set user account data
    setUserAccount(userData);
    
    // Clear force signup mode on successful signup
    setForceSignupMode(false);
    
    // Navigate to dashboard
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT INITIATED ===');
    setUserAccount(null);
    setCurrentView('landing');
    setForceSignupMode(false);
    localStorage.removeItem('bankcheck_fraud_history');
    localStorage.removeItem('bankcheck_check_history');
    localStorage.removeItem('bankcheck_account_database');
  };

  const handleUpgrade = () => {
    // Demo mode - show alert
    alert('This is a demo. Upgrade functionality has been removed in the migration.');
  };

  const handleCheckPerformed = () => {
    setUserAccount((prev: any) => ({
      ...prev,
      checksUsed: prev.checksUsed + 1,
    }));
  };

  const handleUserAccountUpdate = (updatedAccount: any) => {
    // Update the user account state with the new data
    setUserAccount(updatedAccount);
  };

  const handleBackToLogin = () => {
    setForceSignupMode(false);
    setCurrentView('login');
  };

  const handleSuccessContinue = () => {
    // Clear URL parameters and go to dashboard
    window.history.replaceState({}, document.title, window.location.pathname);
    setForceSignupMode(false);
    setCurrentView('dashboard');
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoginForm 
          onLogin={handleLogin} 
          onSignUp={handleGetStarted}
          onBackToWebsite={handleBackToWebsite}
        />
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <SignUpForm 
        onSignUp={handleSignUp} 
        onBackToLogin={handleBackToLogin}
        onBackToWebsite={handleBackToWebsite}
        forceSignupMode={forceSignupMode}
      />
    );
  }

  if (currentView === 'success') {
    return <SuccessPage onContinue={handleSuccessContinue} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Dashboard 
        onLogout={handleLogout} 
        userAccount={userAccount}
        onUpgrade={handleUpgrade}
        onCheckPerformed={handleCheckPerformed}
        onUserAccountUpdate={handleUserAccountUpdate}
      />
    </div>
  );
}