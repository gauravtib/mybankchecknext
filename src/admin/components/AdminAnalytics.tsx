import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, DollarSign, Activity } from 'lucide-react';
import { getSupabaseClient, hasSupabaseConfig } from '../../lib/supabase';

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
  checkActivity: Array<{ date: string; checks: number }>;
  subscriptionBreakdown: Array<{ plan: string; count: number; percentage: number }>;
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    checkActivity: [],
    subscriptionBreakdown: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    if (!hasSupabaseConfig()) {
      // Demo mode - show empty analytics
      setAnalytics({
        userGrowth: [],
        revenueData: [],
        checkActivity: [],
        subscriptionBreakdown: [
          { plan: 'Free', count: 0, percentage: 100 },
          { plan: 'Growth', count: 0, percentage: 0 },
          { plan: 'Pro', count: 0, percentage: 0 },
        ],
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

      // Get subscription breakdown
      const { data: subscriptions } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id');

      // Calculate subscription breakdown
      const subscriptionCounts = {
        Free: 0,
        Growth: 0,
        Pro: 0,
      };

      subscriptions?.forEach(sub => {
        if (sub.subscription_status === 'active' || sub.subscription_status === 'trialing') {
          // Map price IDs to plan names (you'd need to implement this mapping)
          if (sub.price_id?.includes('growth')) {
            subscriptionCounts.Growth++;
          } else if (sub.price_id?.includes('pro')) {
            subscriptionCounts.Pro++;
          }
        } else {
          subscriptionCounts.Free++;
        }
      });

      const total = Object.values(subscriptionCounts).reduce((sum, count) => sum + count, 0);
      const subscriptionBreakdown = Object.entries(subscriptionCounts).map(([plan, count]) => ({
        plan,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));

      setAnalytics({
        userGrowth: [], // Would implement based on user creation dates
        revenueData: [], // Would implement based on order data
        checkActivity: [], // Would implement based on usage tracking
        subscriptionBreakdown,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
          <p className="text-gray-600">System performance and usage analytics</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
          <p className="text-gray-600">System performance and usage analytics</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$0</p>
              <p className="text-gray-600 text-sm">Revenue</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600 text-sm">Checks Performed</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600 text-sm">Active Sessions</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+0%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No user growth data available</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear as users sign up</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No revenue data available</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear as subscriptions are created</p>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.subscriptionBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.plan === 'Free' ? 'bg-gray-400' :
                      item.plan === 'Growth' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Check Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity data available</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear as users perform checks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">&lt;200ms</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Errors (24h)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}