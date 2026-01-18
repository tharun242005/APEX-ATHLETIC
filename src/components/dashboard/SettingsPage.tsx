import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Bell, Shield, Palette, Globe, Database } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import BackgroundAnimation from '../BackgroundAnimation'

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your personal information and preferences'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configure how you receive updates and alerts'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Control your data privacy and account security'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      description: 'Customize the look and feel of your dashboard'
    },
    {
      id: 'language',
      title: 'Language & Region',
      icon: <Globe className="w-5 h-5" />,
      description: 'Set your preferred language and timezone'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: <Database className="w-5 h-5" />,
      description: 'Export, import, or delete your analysis data'
    }
  ]

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0D1B2A' }}>
      {/* Background Animation */}
      <BackgroundAnimation blur={false} intensity="medium" sportsTheme={true} className="fixed inset-0 z-0" />
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={onBack}
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
                className="px-4 py-2"
              >
                Back
              </Button>
              <div>
                <h1 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ 
                    fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
                    color: '#FFFFFF'
                  }}
                >
                  SETTINGS
                </h1>
                <p className="text-xl" style={{ color: '#8A9BA8' }}>
                  Customize your experience and manage your account
                </p>
              </div>
            </div>
          </motion.div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                onClick={() => setActiveTab(section.id)}
                className="cursor-pointer"
              >
                <Card 
                  className={`p-6 transition-all duration-300 ${
                    activeTab === section.id 
                      ? 'border-2' 
                      : 'border border-opacity-20 hover:border-opacity-40'
                  }`}
                  style={{
                    backgroundColor: '#1B263B',
                    borderColor: activeTab === section.id ? '#00F5D4' : 'rgba(0, 245, 212, 0.2)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: activeTab === section.id 
                          ? 'rgba(0, 245, 212, 0.2)' 
                          : 'rgba(0, 245, 212, 0.1)',
                        color: activeTab === section.id ? '#00F5D4' : '#8A9BA8'
                      }}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-bold mb-2"
                        style={{ color: '#FFFFFF' }}
                      >
                        {section.title}
                      </h3>
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: '#8A9BA8' }}
                      >
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Settings Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <Card 
              className="p-8"
              style={{
                backgroundColor: '#1B263B',
                border: '1px solid rgba(0, 245, 212, 0.2)',
                borderRadius: '16px'
              }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ color: '#FFFFFF' }}
              >
                {settingsSections.find(s => s.id === activeTab)?.title}
              </h2>
              
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue="run40081"
                        className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                        style={{
                          backgroundColor: '#2A3441',
                          borderColor: 'rgba(0, 245, 212, 0.3)',
                          color: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue="run40081@example.com"
                        className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                        style={{
                          backgroundColor: '#2A3441',
                          borderColor: 'rgba(0, 245, 212, 0.3)',
                          color: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Professional Athlete focused on performance optimization and data-driven training."
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                      style={{
                        backgroundColor: '#2A3441',
                        borderColor: 'rgba(0, 245, 212, 0.3)',
                        color: '#FFFFFF'
                      }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    className="px-8 py-3"
                  >
                    Save Changes
                  </Button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Email Notifications</h3>
                        <p className="text-sm" style={{ color: '#8A9BA8' }}>Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Push Notifications</h3>
                        <p className="text-sm" style={{ color: '#8A9BA8' }}>Get real-time alerts</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Analysis Reminders</h3>
                        <p className="text-sm" style={{ color: '#8A9BA8' }}>Remind me to analyze my performance</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Data Sharing</h3>
                      <p className="text-sm mb-4" style={{ color: '#8A9BA8' }}>
                        Control how your performance data is shared with coaches and trainers
                      </p>
                      <div className="flex gap-4">
                        <Button variant="secondary" size="sm">Private</Button>
                        <Button variant="primary" size="sm">Share with Team</Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Account Security</h3>
                      <p className="text-sm mb-4" style={{ color: '#8A9BA8' }}>
                        Manage your password and two-factor authentication
                      </p>
                      <Button variant="primary" size="sm">Change Password</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Theme
                      </label>
                      <select 
                        className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                        style={{
                          backgroundColor: '#2A3441',
                          borderColor: 'rgba(0, 245, 212, 0.3)',
                          color: '#FFFFFF'
                        }}
                      >
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Accent Color
                      </label>
                      <div className="flex gap-2">
                        {['#00F5D4', '#8B5CF6', '#FF6B6B', '#4ECDC4'].map(color => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-full border-2"
                            style={{ backgroundColor: color, borderColor: '#FFFFFF' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Language
                      </label>
                      <select 
                        className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                        style={{
                          backgroundColor: '#2A3441',
                          borderColor: 'rgba(0, 245, 212, 0.3)',
                          color: '#FFFFFF'
                        }}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#E0E6ED' }}>
                        Timezone
                      </label>
                      <select 
                        className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                        style={{
                          backgroundColor: '#2A3441',
                          borderColor: 'rgba(0, 245, 212, 0.3)',
                          color: '#FFFFFF'
                        }}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">Greenwich Mean Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Export Data</h3>
                      <p className="text-sm mb-4" style={{ color: '#8A9BA8' }}>
                        Download all your analysis data and performance metrics
                      </p>
                      <Button variant="primary" size="sm">Export All Data</Button>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#2A3441' }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>Delete Account</h3>
                      <p className="text-sm mb-4" style={{ color: '#8A9BA8' }}>
                        Permanently delete your account and all associated data
                      </p>
                      <Button variant="secondary" size="sm" style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
