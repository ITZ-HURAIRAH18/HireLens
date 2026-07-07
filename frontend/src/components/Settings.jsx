import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Key, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
// Preserving useAuth if it exists in your local setup
import { useAuth } from '../lib/auth';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Safely use useAuth in case the provider isn't wrapped yet
  const auth = useAuth ? useAuth() : { user: null, logout: () => {} };
  const user = auth?.user;
  const logout = auth?.logout;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'api', name: 'API Keys', icon: Key },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-up pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  activeTab === tab.id
                    ? 'bg-orange-50 text-[#d97757]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap w-full text-left'
                )}
              >
                <tab.icon
                  className={cn(
                    activeTab === tab.id ? 'text-[#d97757]' : 'text-slate-400 group-hover:text-slate-500',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account's profile information and email address.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <img
                        className="h-20 w-20 rounded-full border border-slate-200"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="Avatar"
                      />
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">Change avatar</Button>
                      <p className="mt-2 text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                      <input type="text" id="first-name" defaultValue={user?.full_name || "Admin User"} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                      <input type="email" id="email" defaultValue={user?.email || "admin@hirelenz.com"} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">Subscription: <span className="font-medium text-slate-700 capitalize">{user?.subscription_tier || "free"}</span></div>
                </CardContent>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
                  {logout && <Button variant="secondary" onClick={logout}>Sign Out</Button>}
                  <Button>Save changes</Button>
                </div>
              </Card>

              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Permanently delete your account and all of your data. This action cannot be undone.
                  </p>
                  <Button variant="danger">Delete Account</Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Authenticator App</p>
                        <p className="text-xs text-slate-500">Not configured</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Decide what emails you'd like to receive from us.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">Email Notifications</h4>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input id="analysis" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#d97757] focus:ring-[#d97757]" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="analysis" className="font-medium text-slate-700">Analysis Complete</label>
                      <p className="text-slate-500">Get notified when your resume analysis is finished processing.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input id="marketing" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#d97757] focus:ring-[#d97757]" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="marketing" className="font-medium text-slate-700">Marketing & Tips</label>
                      <p className="text-slate-500">Receive weekly resume tips and feature updates.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input id="security-alerts" type="checkbox" defaultChecked disabled className="h-4 w-4 rounded border-slate-300 text-[#d97757] focus:ring-[#d97757]" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="security-alerts" className="font-medium text-slate-700">Security Alerts</label>
                      <p className="text-slate-500">Important notifications about your account security (cannot be disabled).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </Card>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>You are currently on the Pro plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-[#d97757]">Pro Subscription</h4>
                      <p className="text-sm text-slate-600 mt-1">Unlimited analyses, AI chat, and PDF exports.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900">$19<span className="text-sm font-normal text-slate-500">/mo</span></div>
                      <p className="text-xs text-slate-500 mt-1">Renews on Nov 1, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary">Manage Subscription</Button>
                    <Button variant="secondary">View Invoices</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between border border-slate-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-700 text-xs tracking-wider">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
                        <p className="text-xs text-slate-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Update</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for programmatic access to HireLenz.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">Production Key</h4>
                      <p className="text-xs text-slate-500 mt-1">Created on Oct 1, 2024</p>
                    </div>
                    <Button variant="secondary" size="sm">Revoke</Button>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <code className="flex-1 block p-2 bg-slate-100 rounded border border-slate-200 text-xs font-mono text-slate-600">
                      hl_live_8f9d2...3b1a
                    </code>
                    <Button variant="secondary" size="sm">Copy</Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Generate New Key</Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
