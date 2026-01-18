import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../ui/LoadingSpinner'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { 
  Home, 
  Activity, 
  History, 
  User, 
  LogOut, 
  Settings,
  Trophy,
  TrendingUp,
  Target,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Calendar,
  Star,
  Zap,
  Flame,
  Upload,
  ArrowLeft
} from 'lucide-react'

import LiveAnalysis from './LiveAnalysis'
import HistoryPage from './HistoryPage'
import ProfilePage from './ProfilePage'
import PracticeZone from './PracticeZone'
import UploadVideoPage from './UploadVideoPage'
import BackgroundAnimation from '../BackgroundAnimation'
import SettingsPage from './SettingsPage'

type View = 'home' | 'live' | 'history' | 'profile' | 'practice' | 'leaderboard' | 'upload' | 'settings'

export default function DashboardLayout() {
  const [view, setView] = useState<View>('home')
  const [displayName, setDisplayName] = useState<string>('Athlete')
  const [loadingName, setLoadingName] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return
      const user = data.user
      if (!user) { setLoadingName(false); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()
      setDisplayName(profile?.username || (user.email?.split('@')[0] ?? 'Athlete'))
      setLoadingName(false)
    })
    return () => { mounted = false }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navigationItems = [
    { key: 'home' as View, label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { key: 'live' as View, label: 'Live Analysis', icon: <Activity className="w-5 h-5" /> },
    { key: 'upload' as View, label: 'Upload Video', icon: <Upload className="w-5 h-5" /> },
    { key: 'practice' as View, label: 'Practice Zone', icon: <Target className="w-5 h-5" /> },
    { key: 'history' as View, label: 'History', icon: <History className="w-5 h-5" /> },
    { key: 'leaderboard' as View, label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { key: 'profile' as View, label: 'Profile', icon: <User className="w-5 h-5" /> },
  ]

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <DashboardHome onStartAnalysis={() => setView('live')} />
      case 'live':
        return <LiveAnalysis />
      case 'upload':
        return <UploadVideoPage />
      case 'practice':
        return <PracticeZone onBack={() => setView('home')} />
      case 'history':
        return <HistoryPage />
      case 'leaderboard':
        return <LeaderboardPage />
      case 'profile':
        return <ProfilePage />
      case 'settings':
        return <SettingsPage onBack={() => setView('profile')} />
      default:
        return <DashboardHome onStartAnalysis={() => setView('live')} />
    }
  }

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#0D1B2A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Background Animation - Full Screen with maximum brightness */}
      <BackgroundAnimation 
        blur={false} 
        intensity="high" 
        sportsTheme={true} 
        className="fixed inset-0 z-0 w-full h-full"
      />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Width */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed md:relative inset-y-0 left-0 z-50 w-80 flex flex-col"
        style={{ 
          backgroundColor: '#1B263B',
          borderRight: '1px solid rgba(0, 245, 212, 0.2)'
        }}
      >
        {/* Sidebar Header */}
        <div className="p-8" style={{ borderBottom: '1px solid rgba(0, 245, 212, 0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
                  boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)'
                }}
              >
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <div 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
                    color: '#FFFFFF'
                  }}
                >
                  APEX ATHLETIC
                </div>
                <div className="text-xs" style={{ color: '#8A9BA8' }}>
                  PROTOTYPE BY THARUN.P
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'rgba(0, 245, 212, 0.1)',
                color: '#00F5D4'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3">
          {navigationItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => {
                setView(item.key)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-xl text-left transition-all duration-300 ${
                view === item.key
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                backgroundColor: view === item.key 
                  ? 'rgba(0, 245, 212, 0.15)' 
                  : 'transparent',
                border: view === item.key 
                  ? '1px solid rgba(0, 245, 212, 0.3)' 
                  : '1px solid transparent',
                boxShadow: view === item.key 
                  ? '0 0 20px rgba(0, 245, 212, 0.2)' 
                  : 'none'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: view === item.key 
                    ? 'rgba(0, 245, 212, 0.2)' 
                    : 'rgba(0, 245, 212, 0.1)',
                  color: view === item.key ? '#00F5D4' : '#8A9BA8'
                }}
              >
                {item.icon}
              </div>
              <span className="font-semibold text-lg">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6" style={{ borderTop: '1px solid rgba(0, 245, 212, 0.1)' }}>
          <div className="text-xs text-center" style={{ color: '#8A9BA8' }}>
            © 2024 APEX ATHLETIC
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area - Fixed for perfect centering */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Header Bar */}
        <header 
          className="px-8 py-6 flex items-center justify-between"
          style={{ 
            backgroundColor: '#1B263B',
            borderBottom: '1px solid rgba(0, 245, 212, 0.1)'
          }}
        >
          {/* Left side - Dashboard title, back button and mobile menu */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-3 rounded-xl transition-colors"
              style={{ 
                backgroundColor: 'rgba(0, 245, 212, 0.1)',
                color: '#00F5D4'
              }}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Back Button for non-home pages */}
            {view !== 'home' && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setView('home')}
                className="flex items-center space-x-2 p-3 rounded-xl transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(0, 245, 212, 0.1)',
                  color: '#00F5D4',
                  border: '1px solid rgba(0, 245, 212, 0.2)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </motion.button>
            )}
            
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
                  color: '#FFFFFF'
                }}
              >
                {navigationItems.find(item => item.key === view)?.label || 'Dashboard'}
              </h1>
              <p className="text-lg" style={{ color: '#8A9BA8' }}>
                {view === 'home' && 'Welcome back to your athletic journey'}
                {view === 'live' && 'Real-time performance analysis'}
                {view === 'practice' && 'Practice and improve your skills'}
                {view === 'history' && 'Your performance history'}
                {view === 'leaderboard' && 'Compete with athletes worldwide'}
                {view === 'profile' && 'Manage your profile and settings'}
                {view === 'upload' && 'Upload and analyze your performance videos'}
                {view === 'settings' && 'Customize your experience and manage your account'}
              </p>
            </div>
          </div>
          
          {/* Right side - User Profile Dropdown */}
          <div className="flex items-center space-x-4">
            <Badge 
              variant="premium" 
              icon={<Star className="w-4 h-4" />}
              className="px-4 py-2"
            >
              Pro
            </Badge>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-300"
                style={{ 
                  backgroundColor: userDropdownOpen ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0, 245, 212, 0.05)',
                  border: '1px solid rgba(0, 245, 212, 0.2)'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
                    boxShadow: '0 0 15px rgba(0, 245, 212, 0.3)'
                  }}
                >
                  <span className="text-white font-bold text-lg">
                    {loadingName ? '...' : displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                    {loadingName ? <LoadingSpinner size="sm" /> : displayName}
                  </div>
                  <div className="text-sm" style={{ color: '#8A9BA8' }}>Elite Athlete</div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: '#00F5D4' }}
                />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-64 rounded-xl shadow-2xl z-50"
                    style={{ 
                      backgroundColor: '#2A3441',
                      border: '1px solid rgba(0, 245, 212, 0.3)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(0, 245, 212, 0.1)' }}>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ 
                            background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
                            boxShadow: '0 0 15px rgba(0, 245, 212, 0.3)'
                          }}
                        >
                          <span className="text-white font-bold text-lg">
                            {loadingName ? '...' : displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                            {loadingName ? <LoadingSpinner size="sm" /> : displayName}
                          </div>
                          <div className="text-sm" style={{ color: '#8A9BA8' }}>Elite Athlete</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button 
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-opacity-10 transition-colors"
                        style={{ 
                          backgroundColor: 'rgba(0, 245, 212, 0.05)',
                          color: '#E0E6ED'
                        }}
                        onClick={() => {
                          setUserDropdownOpen(false)
                          setView('settings')
                        }}
                      >
                        <Settings className="w-5 h-5" style={{ color: '#8A9BA8' }} />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-opacity-10 transition-colors"
                        style={{ 
                          backgroundColor: 'rgba(255, 107, 107, 0.1)',
                          color: '#FF6B6B'
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Area - PERFECTLY CENTERED */}
        <main className="flex-1 w-full overflow-auto">
          <div className="w-full flex justify-center items-start min-h-full py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex justify-center"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

// Dashboard Home Component - PERFECTLY CENTERED
interface DashboardHomeProps {
  onStartAnalysis: () => void
}

function DashboardHome({ onStartAnalysis }: DashboardHomeProps) {
  const stats = [
    { 
      label: 'Recent Score', 
      value: '87', 
      icon: <BarChart3 className="w-8 h-8" />, 
      color: '#00F5D4',
      gradient: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)'
    },
    { 
      label: 'Personal Best', 
      value: '94', 
      icon: <Trophy className="w-8 h-8" />, 
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)'
    },
    { 
      label: 'Sessions', 
      value: '24', 
      icon: <Calendar className="w-8 h-8" />, 
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #FF6B9D 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%)'
    },
    { 
      label: 'Rank', 
      value: '#12', 
      icon: <TrendingUp className="w-8 h-8" />, 
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C42 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 140, 66, 0.1) 100%)'
    }
  ]

  const recentBadges = [
    { 
      name: 'Power Master', 
      description: 'Top 10% in Power', 
      icon: <Zap className="w-6 h-6" />, 
      variant: 'success' as const,
      gradient: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)'
    },
    { 
      name: 'Consistency King', 
      description: '5 sessions in a row', 
      icon: <Target className="w-6 h-6" />, 
      variant: 'info' as const,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #FF6B9D 100%)'
    },
    { 
      name: 'Speed Demon', 
      description: 'Fastest reaction time', 
      icon: <Flame className="w-6 h-6" />, 
      variant: 'warning' as const,
      gradient: 'linear-gradient(135deg, #FF8C42 0%, #FFD700 100%)'
    }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Welcome Section - PERFECTLY CENTERED */}
      <div className="w-full flex flex-col items-center justify-center text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 w-full max-w-6xl"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-cyan-300 to-blue-400 bg-clip-text text-transparent"
            style={{ 
              fontFamily: 'Inter, system-ui, sans-serif',
              textShadow: '0 0 30px rgba(0, 245, 212, 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            WELCOME TO YOUR ATHLETIC JOURNEY
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Track your progress, analyze your performance, and unlock your full potential with AI-powered insights.
          </motion.p>
        </motion.div>
      </div>

      {/* Stats Grid - PERFECTLY CENTERED */}
      <div className="w-full flex justify-center mb-20">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.7 + index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="flex justify-center"
            >
              <div 
                className="relative p-8 rounded-3xl text-center overflow-hidden transition-all duration-300 hover:shadow-2xl w-full max-w-xs"
                style={{
                  background: stat.bgGradient,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {/* Animated Icon */}
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{ 
                    background: stat.gradient,
                    boxShadow: `0 0 30px ${stat.color}40`
                  }}
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-white">
                    {stat.icon}
                  </div>
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: stat.gradient,
                      filter: 'blur(20px)'
                    }}
                  />
                </motion.div>
                
                <motion.div 
                  className="text-5xl font-black mb-3"
                  style={{ color: stat.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-lg font-semibold text-gray-200">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Progress Bar - PERFECTLY CENTERED */}
      <div className="w-full flex justify-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="w-full max-w-2xl flex flex-col items-center"
        >
          <div className="text-center mb-8 w-full">
            <h3 className="text-2xl font-bold text-white mb-2">Athletic Level Progress</h3>
            <p className="text-gray-400">Level 8 • 2,400 XP to next level</p>
          </div>
          <div className="w-full max-w-2xl">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 2, delay: 1.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Action Button - PERFECTLY CENTERED */}
      <div className="w-full flex justify-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center w-full max-w-2xl"
        >
          <motion.button
            onClick={onStartAnalysis}
            className="group relative px-12 py-6 text-2xl font-bold rounded-2xl overflow-hidden transition-all duration-300 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
              color: '#0D1B2A',
              boxShadow: '0 0 40px rgba(0, 245, 212, 0.4)'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 60px rgba(0, 245, 212, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-3 justify-center">
              <Activity className="w-8 h-8" />
              Start New Analysis
            </span>
            {/* Ripple effect */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl" />
          </motion.button>
          <p className="text-xl mt-6 text-gray-300 text-center">
            Get instant AI-powered feedback on your performance
          </p>
        </motion.div>
      </div>

      {/* Recent Badges - PERFECTLY CENTERED */}
      <div className="w-full flex justify-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="w-full max-w-6xl flex flex-col items-center"
        >
          <h3 className="text-4xl font-bold text-center mb-12 text-white w-full">
            Recently Earned Badges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {recentBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.8 + index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="flex justify-center"
              >
                <div 
                  className="relative p-8 rounded-3xl text-center overflow-hidden transition-all duration-300 hover:shadow-2xl w-full max-w-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(42, 52, 65, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
                    border: '1px solid rgba(0, 245, 212, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
                    style={{ 
                      background: badge.gradient,
                      boxShadow: '0 0 30px rgba(0, 245, 212, 0.3)'
                    }}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="text-white">
                      {badge.icon}
                    </div>
                  </motion.div>
                  <h4 className="text-2xl font-bold mb-3 text-white">
                    {badge.name}
                  </h4>
                  <p className="text-lg mb-6 text-gray-300">
                    {badge.description}
                  </p>
                  <Badge 
                    variant={badge.variant} 
                    className="px-6 py-3 text-sm font-bold rounded-full"
                    animated
                  >
                    Earned
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer - PERFECTLY CENTERED */}
      <div className="w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="text-center py-12 border-t border-gray-700 w-full max-w-6xl"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h4 className="text-2xl font-bold text-white mb-2">APEX ATHLETIC</h4>
                <p className="text-gray-400">Sports Talent Assessment Platform</p>
                <p className="text-sm text-gray-500 mt-2">© 2024 SAI Organization</p>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Dashboard</a>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Profile</a>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Live Demo</a>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Contact</a>
              </div>
              
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'github'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-cyan-400 transition-all duration-300"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)'
                    }}
                  >
                    <div className="w-5 h-5 bg-current rounded-sm" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Leaderboard Page Component
function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, name: 'Alex Johnson', score: 98, sport: 'Basketball', badge: 'Champion' },
    { rank: 2, name: 'Sarah Chen', score: 96, sport: 'Tennis', badge: 'Elite' },
    { rank: 3, name: 'Mike Rodriguez', score: 94, sport: 'Soccer', badge: 'Elite' },
    { rank: 4, name: 'Emma Wilson', score: 92, sport: 'Basketball', badge: 'Pro' },
    { rank: 5, name: 'David Kim', score: 90, sport: 'Cricket', badge: 'Pro' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 w-full"
      >
        <h2 
          className="text-5xl font-bold mb-6"
          style={{ 
            fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
            color: '#FFFFFF'
          }}
        >
          Global Leaderboard
        </h2>
        <p className="text-xl" style={{ color: '#8A9BA8' }}>
          Compete with athletes worldwide and climb the ranks
        </p>
      </motion.div>

      <Card 
        className="overflow-hidden max-w-5xl w-full"
        style={{
          backgroundColor: '#2A3441',
          border: '1px solid rgba(0, 245, 212, 0.2)',
          borderRadius: '20px'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0, 245, 212, 0.1)' }}>
                <th className="text-left py-6 px-8 text-lg font-semibold" style={{ color: '#8A9BA8' }}>Rank</th>
                <th className="text-left py-6 px-8 text-lg font-semibold" style={{ color: '#8A9BA8' }}>Athlete</th>
                <th className="text-left py-6 px-8 text-lg font-semibold" style={{ color: '#8A9BA8' }}>Sport</th>
                <th className="text-left py-6 px-8 text-lg font-semibold" style={{ color: '#8A9BA8' }}>Score</th>
                <th className="text-left py-6 px-8 text-lg font-semibold" style={{ color: '#8A9BA8' }}>Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((athlete, index) => (
                <motion.tr
                  key={athlete.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="transition-colors duration-300"
                  style={{ 
                    borderBottom: '1px solid rgba(0, 245, 212, 0.05)',
                    backgroundColor: 'transparent'
                  }}
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center">
                      {athlete.rank <= 3 ? (
                        <Trophy 
                          className={`w-6 h-6 mr-3 ${
                            athlete.rank === 1 ? 'text-yellow-400' : 
                            athlete.rank === 2 ? 'text-gray-400' : 'text-amber-600'
                          }`} 
                        />
                      ) : (
                        <span 
                          className="w-6 h-6 mr-3 flex items-center justify-center font-bold text-lg"
                          style={{ color: '#8A9BA8' }}
                        >
                          {athlete.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
                          boxShadow: '0 0 15px rgba(0, 245, 212, 0.3)'
                        }}
                      >
                        <span className="text-white font-bold text-lg">{athlete.name.charAt(0)}</span>
                      </div>
                      <span className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>
                        {athlete.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <Badge variant="default" className="px-4 py-2">
                      {athlete.sport}
                    </Badge>
                  </td>
                  <td className="py-6 px-8">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: '#00F5D4' }}
                    >
                      {athlete.score}
                    </span>
                  </td>
                  <td className="py-6 px-8">
                    <Badge 
                      variant={athlete.badge === 'Champion' ? 'premium' : athlete.badge === 'Elite' ? 'success' : 'info'}
                      className="px-4 py-2"
                    >
                      {athlete.badge}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}