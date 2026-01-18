import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../ui/LoadingSpinner'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { 
  Calendar, 
  Trophy, 
  Eye, 
  Download,
  Target,
  BarChart3
} from 'lucide-react'

interface SessionItem {
  id: string
  drill_type: string
  scores: any
  created_at: string
}

export default function HistoryPage() {
  const [items, setItems] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'drill'>('date')
  const [filterBy, setFilterBy] = useState<string>('all')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setItems([]); setLoading(false); return }
        const { data, error } = await supabase
          .from('analysis_sessions')
          .select('id, drill_type, scores, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        if (mounted) setItems(data || [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load history')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const getDrillIcon = (drillType: string) => {
    switch (drillType.toLowerCase()) {
      case 'basketball':
        return '🏀'
      case 'tennis':
        return '🎾'
      case 'soccer':
        return '⚽'
      case 'cricket':
        return '🏏'
      default:
        return '🏃'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 80) return 'info'
    if (score >= 70) return 'warning'
    return 'error'
  }

  const sortedAndFilteredItems = items
    .filter(item => filterBy === 'all' || item.drill_type.toLowerCase().includes(filterBy.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.scores?.score || 0) - (a.scores?.score || 0)
        case 'drill':
          return a.drill_type.localeCompare(b.drill_type)
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your performance history..." />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading History</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <Card>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Analysis History Yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Your performance analysis history will appear here once you complete your first session.
            </p>
            <Button variant="primary" size="lg" icon={<Target className="w-5 h-5" />}>
              Start Your First Analysis
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{items.length}</div>
            <div className="text-slate-400 text-sm">Total Sessions</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">
              {Math.round(items.reduce((acc, item) => acc + (item.scores?.score || 0), 0) / items.length) || 0}
            </div>
            <div className="text-slate-400 text-sm">Average Score</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.max(...items.map(item => item.scores?.score || 0)) || 0}
            </div>
            <div className="text-slate-400 text-sm">Personal Best</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {new Set(items.map(item => item.drill_type)).size}
            </div>
            <div className="text-slate-400 text-sm">Sports Played</div>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'date' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setSortBy('date')}
              icon={<Calendar className="w-4 h-4" />}
            >
              Date
            </Button>
            <Button
              variant={sortBy === 'score' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setSortBy('score')}
              icon={<Trophy className="w-4 h-4" />}
            >
              Score
            </Button>
            <Button
              variant={sortBy === 'drill' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setSortBy('drill')}
              icon={<Target className="w-4 h-4" />}
            >
              Sport
            </Button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Sports</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="soccer">Soccer</option>
              <option value="cricket">Cricket</option>
            </select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Session</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Sport</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Score</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Date</th>
                <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getDrillIcon(item.drill_type)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Session #{item.id.slice(-6)}</div>
                        <div className="text-sm text-slate-400">Analysis Complete</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="default">{item.drill_type}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getScoreColor(item.scores?.score || 0)}`}>
                        {item.scores?.score || '—'}
                      </span>
                      <Badge variant={getScoreBadge(item.scores?.score || 0)}>
                        {item.scores?.score >= 90 ? 'Excellent' : 
                         item.scores?.score >= 80 ? 'Good' : 
                         item.scores?.score >= 70 ? 'Fair' : 'Needs Work'}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                        Export
                      </Button>
                    </div>
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