import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../ui/LoadingSpinner'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { 
  Trophy, 
  Target, 
  Calendar, 
  Share2, 
  Edit3, 
  Save, 
  Award,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react'

export default function ProfilePage() {
  const [username, setUsername] = useState('')
  const [sport, setSport] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('username, sport').eq('id', user.id).maybeSingle()
      if (mounted && data) {
        setUsername(data.username || '')
        setSport(data.sport || '')
      }
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')
      const { error } = await supabase.from('profiles').upsert({ id: user.id, username, sport })
      if (error) throw error
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (e: any) {
      setMessage(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const shareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${username || 'athlete'}`
    navigator.clipboard.writeText(profileUrl)
    setMessage('Profile link copied to clipboard!')
  }

  // Mock data for demonstration
  const profileStats = [
    { label: 'Total Sessions', value: '24', icon: <Calendar className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Personal Best', value: '94', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Current Rank', value: '#12', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
    { label: 'Improvement', value: '+15%', icon: <Zap className="w-5 h-5" />, color: 'text-emerald-400' }
  ]

  const achievements = [
    { name: 'Power Master', description: 'Top 10% in Power', icon: <Zap className="w-4 h-4" />, variant: 'success' as const, earned: true },
    { name: 'Consistency King', description: '5 sessions in a row', icon: <Target className="w-4 h-4" />, variant: 'info' as const, earned: true },
    { name: 'Speed Demon', description: 'Fastest reaction time', icon: <Star className="w-4 h-4" />, variant: 'warning' as const, earned: true },
    { name: 'Elite Athlete', description: 'Score above 90', icon: <Award className="w-4 h-4" />, variant: 'premium' as const, earned: false }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your profile..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card glow>
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">
              {username ? username.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {username || 'Athlete'}
          </h2>
          <p className="text-slate-400 mb-4">
            {sport ? `${sport} Athlete` : 'Professional Athlete'}
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Share2 className="w-4 h-4" />}
              onClick={shareProfile}
            >
              Share Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profileStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Profile Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Primary Sport
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                >
                  <option value="">Select your primary sport</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Soccer">Soccer</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Track & Field">Track & Field</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  onClick={save}
                  loading={saving}
                >
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm ${
                    message.includes('success') || message.includes('copied')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Achievements */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={`${!achievement.earned ? 'opacity-50' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                      : 'bg-slate-700'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{achievement.name}</h4>
                    <p className="text-slate-400 text-sm">{achievement.description}</p>
                  </div>
                  <div>
                    {achievement.earned ? (
                      <Badge variant={achievement.variant} animated>
                        Earned
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-6">Performance Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Overall Performance</span>
            <span className="text-emerald-400 font-bold">87/100</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">92</div>
              <div className="text-slate-400 text-sm">Power</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">85</div>
              <div className="text-slate-400 text-sm">Flexibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">84</div>
              <div className="text-slate-400 text-sm">Stability</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}