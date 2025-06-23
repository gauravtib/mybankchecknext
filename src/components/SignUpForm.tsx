'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Building, Phone, ArrowRight, Check, ArrowLeft, Eye, EyeOff, Shield, AlertTriangle, Info } from 'lucide-react';
import { mockUserAccount } from '@/data/mockData';

interface SignUpFormProps {
  onSignUp: (userData: any) => void;
  onBackToLogin: () => void;
  onBackToWebsite: () => void;
  forceSignupMode?: boolean;
}

export function SignUpForm({ onSignUp, onBackToLogin, onBackToWebsite, forceSignupMode }: SignUpFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Company Details
    companyName: '',
    companyPhone: '',
    jobTitle: '',
    
    // Selected Plan
    selectedPlan: 'free',
  });

  // Use centralized stripe configuration
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      checks: '10 monthly checks',
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing businesses with regular volume',
      checks: '500 monthly checks',
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$999',
      period: '/month',
      description: 'For enterprises requiring unlimited fraud checks',
      checks: 'Unlimited checks',
      popular: false,
    },
  ];

  const selectedPlanDetails = plans.find(p => p.id === formData.selectedPlan);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('companyPhone', formatted);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePlanSubmit = async () => {
    console.log('=== PLAN SUBMIT STARTED ===');
    console.log('Selected plan:', formData.selectedPlan);
    
    // Free plan - create account immediately
    console.log('Creating account...');
    await handleCreateAccount();
  };

  const handleCreateAccount = async () => {
    console.log('=== CREATE ACCOUNT STARTED ===');
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      console.log('Demo mode - creating demo account');
      // Demo mode - just call onSignUp with demo data
      const demoUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        companyName: formData.companyName,
        companyPhone: formData.companyPhone,
        jobTitle: formData.jobTitle,
        plan: selectedPlanDetails,
        checksUsed: 0,
        checksLimit: formData.selectedPlan === 'free' ? 10 : formData.selectedPlan === 'growth' ? 500 : -1,
        accountCreated: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionStatus: 'not_started',
      };
      
      console.log('Demo user data created:', demoUserData);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Calling onSignUp with demo data');
      onSignUp(demoUserData);
    } catch (error: any) {
      console.error('Account creation error:', error);
      setAuthError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
      console.log('=== CREATE ACCOUNT COMPLETED ===');
    }
  };

  // Password validation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    return { score, checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const isStep1Valid = () => {
    const hasRequiredFields = formData.firstName.trim() && 
                             formData.lastName.trim() && 
                             formData.email.trim() && 
                             formData.password && 
                             formData.confirmPassword;
    
    const passwordsMatch = formData.password === formData.confirmPassword;
    const passwordStrong = passwordStrength.score >= 3; // Require at least medium strength
    
    console.log('Step 1 validation:', {
      hasRequiredFields,
      passwordsMatch,
      passwordStrong,
      passwordLength: formData.password.length,
      confirmPasswordLength: formData.confirmPassword.length
    });
    
    return hasRequiredFields && passwordsMatch && passwordStrong;
  };

  const isStep2Valid = () => {
    const isValid = formData.companyName.trim() && formData.jobTitle.trim();
    console.log('Step 2 validation:', {
      companyName: formData.companyName.trim(),
      jobTitle: formData.jobTitle.trim(),
      isValid
    });
    return isValid;
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordLongEnough = formData.password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full">
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <ellipse cx="12" cy="11" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="11" r="1" fill="currentColor"/>
                <path d="M8 8L16 8" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                <path d="M8 14L16 14" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                <path d="M6 6L6 8L8 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 6L18 8L16 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M6 16L6 14L8 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 16L18 14L16 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 font-medium">Check and report fraudulent bank accounts</p>
            {forceSignupMode && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  ✨ Starting fresh signup process
                </p>
              </div>
            )}
          </div>

          {/* Configuration Status */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                ⚠️ Demo Mode Active
              </span>
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              This is a demo application. Account will be created in demo mode for testing purposes.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-1 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
                
                {authError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 text-sm font-medium">Error</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{authError}</p>
                    {authError.includes('already exists') && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={onBackToLogin}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                        >
                          Go to Sign In page
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create a secure password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score < 2 ? 'text-red-600' :
                          passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3" />
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3" />
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3" />
                          <span>Lowercase letter</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3" />
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                          <Check className="h-3 w-3" />
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {passwordsMatch ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-xs text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Password Security</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Your password is encrypted and stored securely. We recommend using a unique password that you don't use elsewhere.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep1Valid()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.companyPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">US phone number format: (XXX) XXX-XXXX</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Risk Manager, CFO, Fraud Analyst"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep2Valid()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        formData.selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleInputChange('selectedPlan', plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className={`text-center ${plan.popular ? 'pt-4' : ''}`}>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{plan.description}</p>
                        
                        <div className="mb-6">
                          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600">{plan.period}</span>
                        </div>
                        
                        <div className="text-lg font-semibold text-blue-600 mb-4">{plan.checks}</div>
                      </div>
                      
                      {formData.selectedPlan === plan.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handlePlanSubmit}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : formData.selectedPlan === 'free' ? (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>Continue to Payment</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}