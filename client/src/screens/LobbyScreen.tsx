import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Player } from '@shared/types'
import type { SocketType } from '@/types/socket'

type Props = {
  roomCode: string
  players: Player[]
  isAdmin: boolean
  socket: SocketType
}

const LobbyScreen = ({ roomCode, players, isAdmin, socket }: Props) => {
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
              max="20"
              value={answersPerQuestion}
              onChange={(e) => setAnswersPerQuestion(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
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
        <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Game Lobby
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Room Code</div>
          <div className="text-7xl font-black tracking-widest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            {roomCode}
          </div>
        </div>

        <div>
          <div className="text-xl font-bold mb-4">Players ({players.length})</div>
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-primary/20 hover:border-primary/40 transition-all">
                <span className="font-semibold text-lg">{player.nickname}</span>
                {player.isAdmin && (
                  <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setShowQuestionSetup(true)}
            className="w-full font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            size="lg"
          >
            Start Question
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default LobbyScreen
