import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { Dashboard } from './components/Dashboard';
import { UpgradeModal } from './components/UpgradeModal';
import { SuccessPage } from './components/SuccessPage';
import { getSupabaseClient, hasSupabaseConfig } from './lib/supabase';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'success'>('landing');
  const [userAccount, setUserAccount] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [forceSignupMode, setForceSignupMode] = useState(false);
  const [authStateChangeListener, setAuthStateChangeListener] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('=== INITIALIZING APP ===');
      console.log('Has Supabase config:', hasSupabaseConfig);
      console.log('Force signup mode:', forceSignupMode);
      
      try {
        if (hasSupabaseConfig) {
          // Get the singleton Supabase client
          const supabase = getSupabaseClient();
          
          if (!supabase) {
            console.error('Failed to get Supabase client');
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }

          // If we're in force signup mode, ensure any existing session is cleared
          if (forceSignupMode) {
            console.log('Force signup mode - ensuring clean state');
            try {
              await supabase.auth.signOut();
              // Small delay to ensure cleanup
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.log('No existing session to clear or error clearing:', error);
            }
          } else {
            // Only check for existing session if we're not in forced signup mode
            console.log('Checking for existing session');
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error getting session:', error);
            } else if (session?.user) {
              console.log('Found existing session for:', session.user.email);
              
              // Check URL for success page
              const urlParams = new URLSearchParams(window.location.search);
              const sessionId = urlParams.get('session_id');
              
              if (sessionId) {
                console.log('Redirecting to success page');
                setCurrentView('success');
              } else {
                // Load user subscription data
                await loadUserData(session.user, supabase);
                setCurrentView('dashboard');
              }
            } else {
              console.log('No existing session found');
            }
          }

          // Set up auth state change listener only once
          if (!authStateChangeListener && !isInitialized) {
            console.log('Setting up auth state change listener');
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
              console.log('=== AUTH STATE CHANGE ===');
              console.log('Event:', event);
              console.log('Session user:', session ? session.user.email : 'No session');
              console.log('Force signup mode:', forceSignupMode);
              console.log('Is signing out:', isSigningOut);
              console.log('Current view:', currentView);
              
              // Add a small delay for state synchronization
              await new Promise(resolve => setTimeout(resolve, 100));
              
              if (event === 'SIGNED_IN' && session?.user) {
                // Only auto-sign in if we're not in force signup mode and not currently signing out
                if (!forceSignupMode && !isSigningOut) {
                  console.log('Auto-signing in user');
                  await loadUserData(session.user, supabase);
                  setCurrentView('dashboard');
                } else {
                  console.log('Ignoring sign-in event due to force signup mode or sign out in progress');
                }
              } else if (event === 'SIGNED_OUT') {
                console.log('User signed out, clearing state and returning to landing');
                setUserAccount(null);
                setCurrentView('landing'); // Always go to landing page on sign out
                setIsSigningOut(false);
                setForceSignupMode(false);
                
                // Clear any cached data
                localStorage.removeItem('bankcheck_fraud_history');
                localStorage.removeItem('bankcheck_check_history');
                localStorage.removeItem('bankcheck_account_database');
              }
              
              console.log('=== AUTH STATE CHANGE COMPLETE ===');
            });

            // Store the subscription for cleanup
            setAuthStateChangeListener(subscription);
          }
        } else {
          console.warn('Supabase not configured - running in demo mode');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('=== APP INITIALIZATION COMPLETE ===');
      }
    };

    if (!isInitialized) {
      initializeApp();
    }

    // Cleanup function
    return () => {
      if (authStateChangeListener && isInitialized) {
        console.log('Cleaning up auth state change listener');
        authStateChangeListener.unsubscribe();
      }
    };
  }, [forceSignupMode, isInitialized]); // Re-run when forceSignupMode changes

  const loadUserData = async (user: any, supabase?: any) => {
    try {
      let subscriptionData = null;
      const supabaseClient = supabase || getSupabaseClient();
      
      if (hasSupabaseConfig && supabaseClient) {
        // Fetch user's subscription data - filter for active/trialing subscriptions and get the most recent one
        const { data, error: subscriptionError } = await supabaseClient
          .from('stripe_user_subscriptions')
          .select('*')
          .in('subscription_status', ['active', 'trialing'])
          .order('current_period_end', { ascending: false })
          .limit(1);

        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
        } else if (data && data.length > 0) {
          subscriptionData = data[0];
        }
      }

      // Get product details from price ID if subscription exists
      let planDetails = {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/month',
        checks: '10 monthly checks',
      };

      let checksLimit = 10;

      if (subscriptionData?.price_id) {
        const { getProductByPriceId } = await import('./stripe-config');
        const product = getProductByPriceId(subscriptionData.price_id);
        if (product) {
          planDetails = {
            id: product.id,
            name: product.name,
            price: product.name === 'Growth' ? '$299' : product.name === 'Pro' ? '$999' : '$0',
            period: '/month',
            checks: product.description,
          };
          
          checksLimit = product.name === 'Growth' ? 500 : product.name === 'Pro' ? -1 : 10;
        }
      }

      setUserAccount({
        firstName: user.user_metadata?.first_name || 'Demo',
        lastName: user.user_metadata?.last_name || 'User',
        email: user.email || 'demo@example.com',
        companyName: user.user_metadata?.company_name || 'Demo Company',
        companyPhone: user.user_metadata?.company_phone || '',
        jobTitle: user.user_metadata?.job_title || 'Demo User',
        plan: planDetails,
        checksUsed: 0, // Start fresh for new users - this would come from your usage tracking
        checksLimit,
        accountCreated: user.created_at || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionStatus: subscriptionData?.subscription_status || 'not_started',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set demo user data on error
      setUserAccount({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        companyName: 'Demo Company',
        companyPhone: '',
        jobTitle: 'Demo User',
        plan: {
          id: 'free',
          name: 'Free',
          price: '$0',
          period: '/month',
          checks: '10 monthly checks',
        },
        checksUsed: 0, // Start fresh for demo users too
        checksLimit: 10,
        accountCreated: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionStatus: 'not_started',
      });
    }
  };

  const handleGetStarted = async () => {
    console.log('=== GET STARTED FUNCTION CALLED ===');
    console.log('Has Supabase config:', hasSupabaseConfig);
    console.log('Current user account:', userAccount);
    console.log('Is signing out:', isSigningOut);
    console.log('Current view:', currentView);
    console.log('Force signup mode before:', forceSignupMode);
    
    try {
      if (hasSupabaseConfig) {
        // Set force signup mode first to prevent auto-signin
        console.log('Setting force signup mode to true');
        setForceSignupMode(true);
        
        // Clear any existing user account state immediately
        setUserAccount(null);
        
        // If there's an existing session, clear it first to ensure clean signup
        const supabase = getSupabaseClient();
        if (supabase) {
          console.log('Attempting to clear any existing session');
          
          try {
            // Sign out any existing session
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.log('Sign out error (may be expected if no session):', error.message);
            } else {
              console.log('Successfully signed out existing session');
            }
            
            // Small delay to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.error('Error clearing session:', error);
          }
        }
        
        console.log('Navigating to signup view');
        setCurrentView('signup');
      } else {
        console.log('Demo mode - setting up demo user and going to dashboard');
        // Demo mode - go directly to dashboard with demo data
        setUserAccount({
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          companyName: 'Demo Company',
          companyPhone: '',
          jobTitle: 'Demo User',
          plan: {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: '/month',
            checks: '10 monthly checks',
          },
          checksUsed: 0, // Start fresh for demo
          checksLimit: 10,
          accountCreated: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          subscriptionStatus: 'not_started',
        });
        setCurrentView('dashboard');
      }
      
      console.log('=== GET STARTED FUNCTION COMPLETED ===');
      console.log('Force signup mode after:', forceSignupMode);
      console.log('Target view: signup');
    } catch (error) {
      console.error('Error in handleGetStarted:', error);
    }
  };

  const handleSignIn = () => {
    console.log('=== SIGN IN FUNCTION CALLED ===');
    if (hasSupabaseConfig) {
      setForceSignupMode(false); // Clear force signup mode when going to login
      setCurrentView('login');
    } else {
      // Demo mode - go directly to dashboard
      handleGetStarted();
    }
  };

  const handleBackToWebsite = () => {
    console.log('=== BACK TO WEBSITE CALLED ===');
    setForceSignupMode(false); // Clear force signup mode when going back to landing
    setUserAccount(null); // Clear any user account state
    setCurrentView('landing');
  };

  const handleLogin = async (email: string, password: string) => {
    console.log('=== LOGIN HANDLER CALLED ===');
    console.log('Email:', email);
    
    if (!hasSupabaseConfig) {
      console.error('No Supabase config for login');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('No Supabase client for login');
      return;
    }

    try {
      console.log('Attempting to sign in with Supabase');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user && data.session) {
        console.log('Login successful, user:', data.user.email);
        // Clear force signup mode on successful login
        setForceSignupMode(false);
        // The auth state change listener will handle navigation
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw so LoginForm can handle the error
    }
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
    
    if (isSigningOut) {
      console.log('Already signing out, ignoring duplicate request');
      return;
    }
    
    setIsSigningOut(true);
    setForceSignupMode(false); // Clear force signup mode on logout
    
    try {
      if (hasSupabaseConfig) {
        const supabase = getSupabaseClient();
        if (supabase) {
          console.log('Checking for existing session before logout');
          
          // Check if there's an active session before attempting to sign out
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.warn('Error checking session during logout:', sessionError);
            // Proceed with local logout
            console.log('Proceeding with local logout due to session check error');
            setUserAccount(null);
            setCurrentView('landing');
            setIsSigningOut(false);
            localStorage.removeItem('bankcheck_fraud_history');
            localStorage.removeItem('bankcheck_check_history');
            localStorage.removeItem('bankcheck_account_database');
            return;
          }
          
          if (!session) {
            console.log('No active session found, proceeding with local logout only');
            setUserAccount(null);
            setCurrentView('landing');
            setIsSigningOut(false);
            localStorage.removeItem('bankcheck_fraud_history');
            localStorage.removeItem('bankcheck_check_history');
            localStorage.removeItem('bankcheck_account_database');
            return;
          }
          
          console.log('Active session found, signing out from Supabase');
          
          // Clear local state first to prevent any race conditions
          setUserAccount(null);
          
          // Sign out from Supabase - this should trigger the auth state change listener
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            // Check if the error indicates the session is already missing or not found
            const errorMessage = error.message?.toLowerCase() || '';
            const isSessionMissing = errorMessage.includes('session_not_found') || 
                                   errorMessage.includes('auth session missing') ||
                                   errorMessage.includes('session from session_id claim in jwt does not exist');
            
            if (isSessionMissing) {
              console.warn('Session already missing during logout - user is effectively logged out');
            } else {
              console.error('Error signing out:', error);
            }
            
            // Force logout locally if there's an error
            console.log('Forcing local logout due to error');
            setCurrentView('landing');
            setIsSigningOut(false);
            localStorage.removeItem('bankcheck_fraud_history');
            localStorage.removeItem('bankcheck_check_history');
            localStorage.removeItem('bankcheck_account_database');
          } else {
            // Successful signOut - wait a moment for auth state change, then force navigation if needed
            console.log('Supabase signOut successful, waiting for auth state change...');
            
            // Give the auth state change listener a chance to handle navigation
            setTimeout(() => {
              // If we're still signing out after 2 seconds, force the navigation
              if (isSigningOut) {
                console.log('Auth state change did not trigger navigation, forcing logout');
                setCurrentView('landing');
                setIsSigningOut(false);
                localStorage.removeItem('bankcheck_fraud_history');
                localStorage.removeItem('bankcheck_check_history');
                localStorage.removeItem('bankcheck_account_database');
              }
            }, 2000);
          }
          
          console.log('Supabase signOut completed');
        } else {
          // No Supabase client available, force local logout
          console.log('No Supabase client, forcing local logout');
          setUserAccount(null);
          setCurrentView('landing');
          setIsSigningOut(false);
          localStorage.removeItem('bankcheck_fraud_history');
          localStorage.removeItem('bankcheck_check_history');
          localStorage.removeItem('bankcheck_account_database');
        }
      } else {
        // Demo mode - just clear state and go to landing
        console.log('Demo mode logout');
        setUserAccount(null);
        setCurrentView('landing');
        setIsSigningOut(false);
        localStorage.removeItem('bankcheck_fraud_history');
        localStorage.removeItem('bankcheck_check_history');
        localStorage.removeItem('bankcheck_account_database');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      console.log('Forcing logout due to exception');
      setUserAccount(null);
      setCurrentView('landing');
      setIsSigningOut(false);
      localStorage.removeItem('bankcheck_fraud_history');
      localStorage.removeItem('bankcheck_check_history');
      localStorage.removeItem('bankcheck_account_database');
    }
    
    console.log('=== LOGOUT COMPLETED ===');
  };

  const handleUpgrade = () => {
    if (hasSupabaseConfig) {
      setShowUpgradeModal(true);
    } else {
      // Demo mode - show alert
      alert('This is a demo. Connect to Supabase and Stripe to enable payments.');
    }
  };

  const handleUpgradeComplete = (planId: string) => {
    // This will be handled by the webhook and subscription sync
    setShowUpgradeModal(false);
    // Optionally reload user data to get updated subscription
    if (userAccount) {
      loadUserData({ email: userAccount.email });
    }
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
    setForceSignupMode(false); // Clear force signup mode when going to login
    setCurrentView('login');
  };

  const handleSuccessContinue = () => {
    // Clear URL parameters and go to dashboard
    window.history.replaceState({}, document.title, window.location.pathname);
    setForceSignupMode(false); // Clear force signup mode
    setCurrentView('dashboard');
  };

  // Debug logging for current state
  useEffect(() => {
    console.log('=== APP STATE DEBUG ===');
    console.log('Current view:', currentView);
    console.log('Is loading:', isLoading);
    console.log('Has Supabase config:', hasSupabaseConfig);
    console.log('User account:', userAccount ? 'Present' : 'None');
    console.log('Force signup mode:', forceSignupMode);
    console.log('Is signing out:', isSigningOut);
    console.log('Is initialized:', isInitialized);
    console.log('======================');
  }, [currentView, isLoading, userAccount, forceSignupMode, isSigningOut, isInitialized]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Dashboard 
          onLogout={handleLogout} 
          userAccount={userAccount}
          onUpgrade={handleUpgrade}
          onCheckPerformed={handleCheckPerformed}
          onUserAccountUpdate={handleUserAccountUpdate}
        />
      </div>
      
      {hasSupabaseConfig && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgradeComplete}
          currentPlan={userAccount?.plan?.id}
        />
      )}
    </>
  );
}

export default App;