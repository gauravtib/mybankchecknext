import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, ArrowRight, Star, Menu, X, Code, Zap, Database, Tag, TrendingUp, DollarSign, BarChart, Clock, FileCheck } from 'lucide-react';
import { stripeProducts } from '../stripe-config';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Get Started button clicked');
    onGetStarted();
  };

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Sign In button clicked');
    if (onSignIn) {
      onSignIn();
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Real-Time Fraud Detection',
      description: 'Instantly verify bank account information against our comprehensive fraud database with advanced detection algorithms.',
    },
    {
      icon: AlertTriangle,
      title: 'Multi-Source Intelligence',
      description: 'Based on data collected from a wide range of established financial institutions and non-traditional lenders.',
    },
    {
      icon: Code,
      title: 'Complete API Integration',
      description: 'Full REST API access for seamless integration into your existing systems with comprehensive documentation and webhooks.',
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      description: 'Enterprise-level encryption and security protocols ensure your data remains completely protected.',
    },
    {
      icon: CheckCircle,
      title: 'Instant Results',
      description: 'Get comprehensive fraud analysis in under 2 seconds with detailed risk scoring and recommendations.',
    },
    {
      icon: FileCheck,
      title: 'Associated Accounts',
      description: 'Identify and track networks of related accounts used in fraud schemes, helping you detect sophisticated fraud rings and patterns.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Risk Manager',
      company: 'TechFlow Capital',
      content: 'MyBankCheck provides the fraud detection capabilities we need to protect our business. The API integration made it seamless to add to our existing workflow.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Fraud Analyst',
      company: 'SecureBank',
      content: 'The comprehensive database and real-time API help us make informed decisions quickly. Essential for modern fraud prevention.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'CFO',
      company: 'FinanceFirst',
      content: 'Simple pricing, powerful API, and excellent documentation. MyBankCheck gives us the fraud protection we need without complexity.',
      rating: 5,
    },
  ];

  // Use centralized stripe configuration for pricing
  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      checks: stripeProducts.find(p => p.name === 'Free')?.description || '10 monthly checks',
      buttonText: 'Start Free',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700 text-white',
      popular: false,
    },
    {
      name: 'Growth',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing businesses with regular volume',
      checks: stripeProducts.find(p => p.name === 'Growth')?.description || '500 monthly checks',
      buttonText: 'Start Growth Plan',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      popular: true,
    },
    {
      name: 'Pro',
      price: '$999',
      period: '/month',
      description: 'For enterprises requiring unlimited fraud checks',
      checks: stripeProducts.find(p => p.name === 'Pro')?.description || 'Unlimited checks',
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
      popular: false,
    },
  ];

  // Fraud statistics for the problem section
  const fraudStats = [
    {
      icon: BarChart,
      value: '$50 billion',
      description: 'Bank-specific fraud is skyrocketing to a projected $50 billion',
    },
    {
      icon: DollarSign,
      value: '$125,000',
      description: 'The average business email compromise attack causes $125,000 in losses',
    },
    {
      icon: TrendingUp,
      value: '67%',
      description: 'of financial institutions expect fraud to rise in the next 12 months',
    },
  ];

  const apiFeatures = [
    {
      icon: Zap,
      title: 'Lightning Fast API',
      description: 'Sub-2 second response times with 99.9% uptime SLA',
    },
    {
      icon: Database,
      title: 'Real-time Webhooks',
      description: 'Get notified instantly when fraud reports are updated',
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Bearer token authentication with webhook signature verification',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Complete documentation with code examples in multiple languages',
    },
  ];

  // Risk tag categories for the tagging system section
  const riskTags = [
    { name: 'Fraud', color: 'bg-red-100 text-red-800 border-red-300' },
    { name: 'Default', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { name: 'Stacking', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { name: 'Fake Deposits', color: 'bg-pink-100 text-pink-800 border-pink-300' },
    { name: 'Bank Disconnected', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { name: 'Blocked Payments', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { name: 'Excessive NSFs', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  MyBankCheck
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation - Simplified */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              {onSignIn && (
                <button
                  onClick={handleSignInClick}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={handleGetStartedClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Simplified */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                {onSignIn && (
                  <button
                    onClick={handleSignInClick}
                    className="text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={handleGetStartedClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-left"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Shield className="h-4 w-4 mr-2" />
              Advanced Bank Account Fraud Detection + API
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Collaborative bank account
              <span className="block bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                fraud reporting
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Protect your business with comprehensive bank account fraud detection. 
              Verify accounts instantly via web dashboard or integrate directly with our powerful API.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStartedClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-12 text-sm text-gray-500">
              No credit card required • 10 free checks monthly • Full API access • Setup in 2 minutes
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </section>

      

      {/* Problem Section - REDESIGNED with dark background */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Bank fraud is a massive
              <span className="block text-red-400">and growing problem</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Financial institutions face increasing challenges from sophisticated fraud schemes targeting bank accounts.
              The costs are staggering and rising every year.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fraudStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-700 p-8 rounded-2xl shadow-lg border border-gray-600 text-center">
                  <div className="p-4 bg-red-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-red-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{stat.value}</h3>
                  <p className="text-gray-300 leading-relaxed">{stat.description}</p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-300 font-medium mb-8">
              MyBankCheck helps financial institutions fight back with collaborative fraud detection
            </p>
            <button
              onClick={handleGetStartedClick}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg"
            >
              Start Protecting Your Business
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Advanced Fraud Detection
              <span className="block text-blue-600">Built for Modern Finance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge technology combines machine learning, real-time data analysis, 
              and comprehensive fraud intelligence to protect your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
                  <div className="p-3 bg-blue-100 rounded-xl w-fit mb-6 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tagging System Section */}
      <section id="tagging-system" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Intelligent Risk
              <span className="block text-blue-600">Tagging System</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced tagging system categorizes high risk accounts with precision, helping you identify specific risk patterns and make better decisions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Available Risk Tags</h3>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {riskTags.map((tag, index) => (
                <div key={index} className={`px-4 py-2 rounded-full ${tag.color} border flex items-center space-x-2`}>
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">{tag.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful API
              <span className="block text-blue-600">Integration</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamlessly integrate fraud detection into your existing systems with our comprehensive REST API, 
              complete with webhooks and real-time notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {apiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                  <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* API Code Example */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-900 px-6 py-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-4">API Example</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Check for Fraud</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm"><code>{`curl -X POST https://api.mybankcheck.com/v1/fraud-check \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "routing_number": "021000021",
    "account_number_last4": "5678"
  }'`}</code></pre>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Response</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm"><code>{`{
  "status": "success",
  "data": {
    "fraud_status": "Fraudulent",
    "flagged_count": 3,
    "flagged_by": ["Loot", "Kabbage"],
    "recommendation": "HIGH RISK",
    "tags": ["fraud", "stacking"]
  }
}`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="block text-blue-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include full API access and fraud detection features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-xl overflow-hidden relative ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-lg font-semibold text-blue-600 mb-4">{plan.checks}</div>
                  </div>
                  
                  <button
                    onClick={handleGetStartedClick}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution for your enterprise?</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact our sales team →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Industry
              <span className="block text-blue-600">Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how financial institutions are using MyBankCheck to protect their business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                  <div className="text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Stop Fraud?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join businesses protecting themselves with MyBankCheck.
            Start your free trial today with full API access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStartedClick}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">MyBankCheck</h3>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">
                The most trusted bank account fraud detection platform
              </p>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} MyBankCheck. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}