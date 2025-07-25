'use client';

import React, { useState } from 'react';
import { Key, Webhook, Copy, Eye, EyeOff, Code, Book, Globe, Lock, Zap, Tag, Link } from 'lucide-react';
import { UserAccount } from '@/types';

interface ApiIntegrationProps {
  userAccount?: UserAccount;
}

export function ApiIntegration({ userAccount }: ApiIntegrationProps) {
  const [apiKey, setApiKey] = useState('bk_demo_user_12345abcde');
  const [webhookSecret, setWebhookSecret] = useState('whsec_demo_secret_12345abcde');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fraud-check' | 'submit-fraud' | 'webhooks'>('overview');

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getApiBaseUrl = () => {
    // In production, this would be your actual API domain
    return 'https://api.mybankcheck.com/v1';
  };

  const getWebhookUrl = () => {
    // This would be the user's webhook endpoint
    return 'https://your-domain.com/webhooks/mybankcheck';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'fraud-check', label: 'Fraud Check API', icon: AlertTriangle },
    { id: 'submit-fraud', label: 'Submit Fraud API', icon: Zap },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* API Credentials */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">API Credentials</h3>
        </div>

        <div className="space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(apiKey, 'apiKey')}
                className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy API Key"
              >
                {copiedItem === 'apiKey' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep this secret! Use it in the Authorization header: <code className="bg-gray-100 px-1 rounded">Bearer {apiKey}</code>
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showWebhookSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(webhookSecret, 'webhookSecret')}
                className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy Webhook Secret"
              >
                {copiedItem === 'webhookSecret' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use this to verify webhook signatures from MyBankCheck
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quick Start</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">1. Check for Fraud</h4>
            <p className="text-sm text-gray-600 mb-4">
              Verify bank accounts against our fraud database using last 4 digits
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs text-gray-800">
                POST {getApiBaseUrl()}/fraud-check
              </code>
            </div>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">2. Submit Fraud Reports</h4>
            <p className="text-sm text-gray-600 mb-4">
              Report fraudulent accounts with tags and associated accounts
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs text-gray-800">
                POST {getApiBaseUrl()}/submit-fraud
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Usage Limits & Billing</h3>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Important: API Usage Counts Toward Your Plan Limits</p>
              <p className="text-xs text-yellow-700 mt-1">
                Every fraud check performed via the API will count toward your monthly check limit, just like checks performed through the web interface. 
                Current plan: <strong>{userAccount?.plan?.name || 'Free'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFraudCheckApi = () => (
    <div className="space-y-8">
      {/* Endpoint Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Fraud Check API</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Endpoint</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                POST {getApiBaseUrl()}/fraud-check
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Authentication</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                Authorization: Bearer {apiKey}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Request Format</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Headers</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`Content-Type: application/json
Authorization: Bearer ${apiKey}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "routing_number": "021000021",
  "account_number_last4": "5678"
}`}</code></pre>
            </div>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Compliance Note:</strong> Only provide the last 4 digits of the account number for security and compliance purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Format */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Response Format</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Fraudulent Account Response (200 OK)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "success",
  "data": {
    "fraud_status": "Fraudulent",
    "flagged_count": 3,
    "flagged_by": ["Loot", "Kabbage", "OnDeck"],
    "last_flagged_date": "2024-01-15T10:30:00Z",
    "bank_name": "Chase Bank",
    "times_checked": 15,
    "tags": ["fraud", "stacking", "fake_deposits"],
    "recommendation": "HIGH RISK: Do not process this transaction.",
    "check_id": "chk_1234567890",
    "timestamp": "2024-01-20T14:30:22Z"
  },
  "usage": {
    "checks_used": 1,
    "checks_remaining": 9
  }
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Associated Account Response (200 OK)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "success",
  "data": {
    "fraud_status": "Associated",
    "bank_name": "Wells Fargo Bank",
    "times_checked": 8,
    "tags": ["associated_account"],
    "associated_with": {
      "routing_number": "021000021",
      "account_number_last4": "5678",
      "bank_name": "Chase Bank",
      "reported_by": ["Loot", "Kabbage"]
    },
    "recommendation": "CAUTION: This account is associated with a fraudulent account.",
    "check_id": "chk_1234567891",
    "timestamp": "2024-01-20T14:30:22Z"
  },
  "usage": {
    "checks_used": 2,
    "checks_remaining": 8
  }
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Clean Account Response (200 OK)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "success",
  "data": {
    "fraud_status": "Not Reported",
    "flagged_count": 0,
    "flagged_by": [],
    "bank_name": "Wells Fargo Bank",
    "times_checked": 5,
    "tags": [],
    "recommendation": "LOW RISK: Account appears legitimate.",
    "check_id": "chk_1234567892",
    "timestamp": "2024-01-20T14:30:22Z"
  },
  "usage": {
    "checks_used": 3,
    "checks_remaining": 7
  }
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Error Response (400/429/500)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "error",
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Monthly check limit exceeded",
    "details": "You have used all 10 checks for this month"
  },
  "usage": {
    "checks_used": 10,
    "checks_remaining": 0
  }
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      {/* Response Fields */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Response Fields</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">fraud_status</td>
                <td className="border border-gray-300 px-4 py-2">string</td>
                <td className="border border-gray-300 px-4 py-2">"Fraudulent", "Associated", or "Not Reported"</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">flagged_count</td>
                <td className="border border-gray-300 px-4 py-2">number</td>
                <td className="border border-gray-300 px-4 py-2">Number of fraud reports for this account</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">flagged_by</td>
                <td className="border border-gray-300 px-4 py-2">array</td>
                <td className="border border-gray-300 px-4 py-2">List of companies that reported this account</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">times_checked</td>
                <td className="border border-gray-300 px-4 py-2">number</td>
                <td className="border border-gray-300 px-4 py-2">Total number of times this account has been checked</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">tags</td>
                <td className="border border-gray-300 px-4 py-2">array</td>
                <td className="border border-gray-300 px-4 py-2">Fraud tags: "fraud", "default", "stacking", "fake_deposits", etc.</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-mono">associated_with</td>
                <td className="border border-gray-300 px-4 py-2">object</td>
                <td className="border border-gray-300 px-4 py-2">Details of the fraudulent account this is associated with (if applicable)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Code Examples</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">JavaScript/Node.js</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`const response = await fetch('${getApiBaseUrl()}/fraud-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
  },
  body: JSON.stringify({
    routing_number: '021000021',
    account_number_last4: '5678'
  })
});

const result = await response.json();

if (result.status === 'success') {
  console.log('Fraud Status:', result.data.fraud_status);
  console.log('Times Checked:', result.data.times_checked);
  console.log('Tags:', result.data.tags);
  console.log('Checks Remaining:', result.usage.checks_remaining);
  
  if (result.data.fraud_status === 'Associated') {
    console.log('Associated with:', result.data.associated_with);
  }
} else {
  console.error('Error:', result.error.message);
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`import requests

url = '${getApiBaseUrl()}/fraud-check'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
}
data = {
    'routing_number': '021000021',
    'account_number_last4': '5678'
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result['status'] == 'success':
    print(f"Fraud Status: {result['data']['fraud_status']}")
    print(f"Times Checked: {result['data']['times_checked']}")
    print(f"Tags: {result['data']['tags']}")
    print(f"Checks Remaining: {result['usage']['checks_remaining']}")
    
    if result['data']['fraud_status'] == 'Associated':
        print(f"Associated with: {result['data']['associated_with']}")
else:
    print(f"Error: {result['error']['message']}")`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">cURL</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`curl -X POST ${getApiBaseUrl()}/fraud-check \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "routing_number": "021000021",
    "account_number_last4": "5678"
  }'`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmitFraudApi = () => (
    <div className="space-y-8">
      {/* Endpoint Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Submit Fraud API</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Endpoint</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                POST {getApiBaseUrl()}/submit-fraud
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Authentication</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                Authorization: Bearer {apiKey}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Request Format */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Request Format</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Headers</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`Content-Type: application/json
Authorization: Bearer ${apiKey}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "routing_number": "021000021",
  "account_number_last4": "5678",
  "account_holder_name": "John Smith",
  "tags": ["fraud", "stacking"],
  "associated_accounts": [
    {
      "routing_number": "111000025",
      "account_number_last4": "1234",
      "account_holder_name": "John Smith",
      "bank_name": "Wells Fargo Bank"
    }
  ]
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Required Fields</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <code>routing_number</code> - 9-digit bank routing number</li>
                <li>• <code>account_number_last4</code> - Last 4 digits of account number only</li>
                <li>• <code>tags</code> - Array of fraud tags (at least one required)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Compliance:</strong> Only provide the last 4 digits of account numbers for security and privacy protection.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Available Fraud Tags</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['fraud', 'default', 'stacking', 'fake_deposits', 'bank_disconnected', 'blocked_payments', 'excessive_nsfs'].map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Response Format */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Response Format</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Success Response (201 Created)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "success",
  "data": {
    "submission_id": "sub_1234567890",
    "routing_number": "021000021",
    "account_number_last4": "5678",
    "submitted_by": "${userAccount?.email || 'your-company@example.com'}",
    "company_name": "${userAccount?.plan?.name === 'free' ? 'Your Company' : 'Bluevine'}",
    "tags": ["fraud", "stacking"],
    "associated_accounts_processed": 1,
    "timestamp": "2024-01-20T14:30:22Z",
    "status": "processed"
  },
  "message": "Fraud report submitted successfully and added to database"
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Error Response (400/422/500)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid routing number format",
    "details": "Routing number must be exactly 9 digits"
  }
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Code Examples</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">JavaScript/Node.js</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`const response = await fetch('${getApiBaseUrl()}/submit-fraud', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
  },
  body: JSON.stringify({
    routing_number: '021000021',
    account_number_last4: '5678',
    account_holder_name: 'John Smith',
    tags: ['fraud', 'stacking'],
    associated_accounts: [
      {
        routing_number: '111000025',
        account_number_last4: '1234',
        account_holder_name: 'John Smith',
        bank_name: 'Wells Fargo Bank'
      }
    ]
  })
});

const result = await response.json();

if (result.status === 'success') {
  console.log('Fraud report submitted:', result.data.submission_id);
  console.log('Tags applied:', result.data.tags);
  console.log('Associated accounts processed:', result.data.associated_accounts_processed);
} else {
  console.error('Error:', result.error.message);
}`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`import requests

url = '${getApiBaseUrl()}/submit-fraud'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
}
data = {
    'routing_number': '021000021',
    'account_number_last4': '5678',
    'account_holder_name': 'John Smith',
    'tags': ['fraud', 'stacking'],
    'associated_accounts': [
        {
            'routing_number': '111000025',
            'account_number_last4': '1234',
            'account_holder_name': 'John Smith',
            'bank_name': 'Wells Fargo Bank'
        }
    ]
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result['status'] == 'success':
    print(f"Fraud report submitted: {result['data']['submission_id']}")
    print(f"Tags applied: {result['data']['tags']}")
    print(f"Associated accounts processed: {result['data']['associated_accounts_processed']}")
else:
    print(f"Error: {result['error']['message']}")`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-8">
      {/* Webhook Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Webhook className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Webhooks</h3>
        </div>

        <div className="space-y-6">
          <p className="text-gray-600">
            Webhooks allow MyBankCheck to notify your application when important events occur, such as when a new fraud report 
            is submitted for an account you've previously checked, or when check counts are updated.
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Your Webhook Endpoint</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                {getWebhookUrl()}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Configure this URL in your application to receive webhook notifications
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Webhook Secret</h4>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm font-mono text-gray-800">
                {webhookSecret}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use this secret to verify that webhook requests are from MyBankCheck
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Events */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Webhook Events</h3>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">fraud_report.created</h4>
            <p className="text-sm text-gray-600 mb-3">
              Triggered when a new fraud report is submitted for a bank account that you've previously checked.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "event": "fraud_report.created",
  "timestamp": "2024-01-20T14:30:22Z",
  "data": {
    "routing_number": "021000021",
    "account_number_last4": "5678",
    "reported_by": "Loot",
    "report_date": "2024-01-20T14:30:22Z",
    "total_reports": 3,
    "times_checked": 15,
    "tags": ["fraud", "stacking"],
    "associated_accounts": 1
  }
}`}</code></pre>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">account.check_updated</h4>
            <p className="text-sm text-gray-600 mb-3">
              Triggered when the check count for a previously checked account is updated due to new fraud checks.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "event": "account.check_updated",
  "timestamp": "2024-01-20T14:30:22Z",
  "data": {
    "routing_number": "021000021",
    "account_number_last4": "5678",
    "previous_check_count": 14,
    "new_check_count": 15,
    "total_reports": 4,
    "fraud_status": "Fraudulent",
    "last_check_id": "chk_1234567890"
  }
}`}</code></pre>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">associated_account.created</h4>
            <p className="text-sm text-gray-600 mb-3">
              Triggered when an account you've previously checked is marked as associated with a newly reported fraudulent account.
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`{
  "event": "associated_account.created",
  "timestamp": "2024-01-20T14:30:22Z",
  "data": {
    "routing_number": "111000025",
    "account_number_last4": "1234",
    "associated_with": {
      "routing_number": "021000021",
      "account_number_last4": "5678",
      "bank_name": "Chase Bank"
    },
    "reported_by": "Loot",
    "times_checked": 8
  }
}`}</code></pre>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Verification */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Webhook Verification</h3>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            To verify that webhook requests are from MyBankCheck, check the <code>X-MyBankCheck-Signature</code> header.
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Node.js Example</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

// Express.js webhook handler
app.post('/webhooks/mybankcheck', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-mybankcheck-signature'];
  const payload = req.body;
  
  if (!verifyWebhook(payload, signature, '${webhookSecret}')) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.event) {
    case 'fraud_report.created':
      console.log('New fraud report:', event.data);
      // Handle the fraud report
      break;
    case 'account.check_updated':
      console.log('Check count updated:', event.data);
      // Handle the check update
      break;
    case 'associated_account.created':
      console.log('Associated account created:', event.data);
      // Handle the associated account
      break;
  }
  
  res.status(200).send('OK');
});`}</code></pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Python Example</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm"><code>{`import hmac
import hashlib
import json
from flask import Flask, request

app = Flask(__name__)

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    received_signature = signature.replace('sha256=', '')
    
    return hmac.compare_digest(expected_signature, received_signature)

@app.route('/webhooks/mybankcheck', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-MyBankCheck-Signature')
    payload = request.get_data()
    
    if not verify_webhook(payload, signature, '${webhookSecret}'):
        return 'Invalid signature', 401
    
    event = json.loads(payload)
    
    if event['event'] == 'fraud_report.created':
        print('New fraud report:', event['data'])
        # Handle the fraud report
    elif event['event'] == 'account.check_updated':
        print('Check count updated:', event['data'])
        # Handle the check update
    elif event['event'] == 'associated_account.created':
        print('Associated account created:', event['data'])
        # Handle the associated account
    
    return 'OK', 200`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Integration</h2>
        <p className="text-gray-600">Integrate MyBankCheck fraud detection into your own applications</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'fraud-check' && renderFraudCheckApi()}
          {activeTab === 'submit-fraud' && renderSubmitFraudApi()}
          {activeTab === 'webhooks' && renderWebhooks()}
        </div>
      </div>
    </div>
  );
}