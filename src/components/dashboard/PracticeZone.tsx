import React from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Target, Zap, Trophy, Clock, Users, Star } from 'lucide-react'

interface PracticeZoneProps {
  onBack?: () => void
}

const PracticeZone: React.FC<PracticeZoneProps> = () => {
  const practiceStats = [
    { label: 'Practice Sessions', value: '12', icon: <Target className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Total Time', value: '2.5h', icon: <Clock className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Improvement', value: '+15%', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Rank', value: '#8', icon: <Users className="w-5 h-5" />, color: 'text-purple-400' }
  ]

  const recentAchievements = [
    { name: 'Practice Streak', description: '5 days in a row', icon: <Zap className="w-4 h-4" />, variant: 'success' as const },
    { name: 'Form Master', description: 'Perfect technique', icon: <Target className="w-4 h-4" />, variant: 'info' as const },
    { name: 'Speed Boost', description: 'Faster reaction time', icon: <Star className="w-4 h-4" />, variant: 'warning' as const }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Practice Zone</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Practice your skills, improve your technique, and track your progress in a relaxed environment.
        </p>
      </div>

      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {practiceStats.map((stat, index) => (
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

      {/* Practice Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Practice */}
        <Card hover glow className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Live Practice</h3>
          <p className="text-slate-400 mb-6">
            Practice with real-time feedback and analysis. Perfect your technique with instant AI guidance.
          </p>
          <Button variant="primary" size="lg" fullWidth>
            Start Live Practice
          </Button>
        </Card>

        {/* Guided Practice */}
        <Card hover glow className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Guided Practice</h3>
          <p className="text-slate-400 mb-6">
            Follow structured practice sessions designed to improve specific aspects of your performance.
          </p>
          <Button variant="secondary" size="lg" fullWidth>
            Start Guided Practice
          </Button>
        </Card>
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Recent Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                  {achievement.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{achievement.name}</h4>
                <p className="text-slate-400 text-sm mb-3">{achievement.description}</p>
                <Badge variant={achievement.variant} animated>
                  Earned
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Practice Tips */}
      <Card>
        <h3 className="text-xl font-bold text-white mb-4">Practice Tips</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">Consistency is Key</h4>
              <p className="text-slate-400 text-sm">Practice regularly, even if it's just 10-15 minutes a day.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">Focus on Form</h4>
              <p className="text-slate-400 text-sm">Quality over quantity. Perfect your technique before increasing intensity.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-white">Track Progress</h4>
              <p className="text-slate-400 text-sm">Use our analytics to identify areas for improvement and celebrate wins.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PracticeZone
