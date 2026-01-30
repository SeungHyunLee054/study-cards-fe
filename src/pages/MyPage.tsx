import { Link } from 'react-router-dom'
import { Play, Clock, CheckCircle, AlertCircle, BarChart3, Calendar, Settings, LogOut, User, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

const decks = [
  { id: 'ds', name: 'Data Structures', new: 15, learning: 8, review: 42, color: 'border-l-primary' },
  { id: 'algo', name: 'Algorithms', new: 23, learning: 5, review: 31, color: 'border-l-green-500' },
  { id: 'sys', name: 'System Design', new: 45, learning: 0, review: 0, color: 'border-l-purple-500' },
  { id: 'net', name: 'Networking', new: 38, learning: 2, review: 12, color: 'border-l-orange-500' },
]

const recentActivity = [
  { date: 'Today', studied: 0, correct: 0 },
  { date: 'Yesterday', studied: 12, correct: 10 },
  { date: '2 days ago', studied: 8, correct: 7 },
]

export function MyPage() {
  const totalDue = decks.reduce((acc, d) => acc + d.review + d.learning, 0)
  const totalNew = decks.reduce((acc, d) => acc + d.new, 0)

  const user = {
    name: 'User',
    email: 'user@example.com',
    streak: 3,
    totalStudied: 156,
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/logout">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="mt-1 text-gray-600">
              {totalDue > 0
                ? `You have ${totalDue} cards due for review`
                : 'Start learning with new cards'}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/study">
              <Play className="mr-2 h-5 w-5" />
              Study Now
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalDue}</div>
                <div className="text-sm text-gray-500">Due Today</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.totalStudied}</div>
                <div className="text-sm text-gray-500">Total Studied</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalNew}</div>
                <div className="text-sm text-gray-500">New Cards</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.streak} days</div>
                <div className="text-sm text-gray-500">Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          {/* Decks */}
          <div className="col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Decks</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      className={`p-4 rounded-lg border-l-4 ${deck.color} bg-gray-50 hover:bg-gray-100 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{deck.name}</div>
                          <div className="mt-1 flex gap-4 text-sm">
                            <span className="text-primary">{deck.new} new</span>
                            <span className="text-orange-600">{deck.learning} learning</span>
                            <span className="text-green-600">{deck.review} review</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/study?deck=${deck.id}`}>Study</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentActivity.map((day) => (
                    <div key={day.date} className="flex justify-between text-sm">
                      <span className="text-gray-600">{day.date}</span>
                      <span className="text-gray-900">
                        {day.studied > 0
                          ? `${day.correct}/${day.studied} correct`
                          : '-'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-medium text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Limit</span>
                    <span className="font-medium text-gray-900">5 cards</span>
                  </div>
                </div>
                <Button size="sm" className="mt-4 w-full" asChild>
                  <Link to="/upgrade">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Study Cards. Built with React + Vite.</p>
        </div>
      </footer>
    </div>
  )
}
