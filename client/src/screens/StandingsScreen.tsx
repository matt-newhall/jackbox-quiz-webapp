import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Player } from '@shared/types'
import type { SocketType } from '@/types/socket'

type Props = {
  players: Player[]
  isAdmin: boolean
  socket: SocketType
}

const StandingsScreen = ({ players, isAdmin, socket }: Props) => {
  const [showQuestionSetup, setShowQuestionSetup] = useState(false)
  const [answersPerQuestion, setAnswersPerQuestion] = useState(1)
  const [questionTitle, setQuestionTitle] = useState('')

  const handleStartQuestion = () => {
    socket.emit('admin_ask_question', {
      answersPerQuestion,
      questionTitle: questionTitle.trim() || undefined
    })
    setQuestionTitle('')
    setAnswersPerQuestion(1)
    setShowQuestionSetup(false)
  }

  const nonAdminPlayers = players.filter(p => !p.isAdmin)
  const sortedPlayers = [...nonAdminPlayers].sort((a, b) => b.score - a.score)

  if (showQuestionSetup && isAdmin) {
    return (
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Question Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Question Title (Optional)</label>
            <Input
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder="e.g., Name a song by The Beatles"
              className="h-11 text-base"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave blank if you don't want to show a title</p>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Number of Answers per Question</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={answersPerQuestion}
              onChange={(e) => setAnswersPerQuestion(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="h-11 text-base"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowQuestionSetup(false)}
              variant="outline"
              className="flex-1 font-semibold"
            >
              Back
            </Button>
            <Button
              onClick={handleStartQuestion}
              className="flex-1 font-bold text-lg h-12 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Start Question
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Current Standings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-5 rounded-xl transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-500 shadow-xl'
                  : 'bg-muted/50 border-2 border-primary/10 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-black w-12 ${index === 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  #{index + 1}
                </div>
                {player.profilePicture && (
                  <img
                    src={player.profilePicture}
                    alt={player.nickname}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                  />
                )}
                <div className={`font-bold text-lg ${index === 0 ? 'text-yellow-100' : ''}`}>{player.nickname}</div>
              </div>
              <div className={`text-2xl font-black ${index === 0 ? 'text-yellow-400' : ''}`}>
                {player.score} pts
              </div>
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="mt-6">
            <Button
              className="w-full font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={() => setShowQuestionSetup(true)}
            >
              Next Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StandingsScreen
