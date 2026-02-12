import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Answer } from '@shared/types'
import type { SocketType } from '@/types/socket'

type Props = {
  answers: Answer[]
  isAdmin: boolean
  socket: SocketType
  answersPerQuestion?: number
  questionTitle?: string
}

const PointsAwardedScreen = ({
  answers,
  isAdmin,
  socket,
  answersPerQuestion = 1,
  questionTitle
}: Props) => {
  const handlePointsChange = (playerId: string, delta: number) => {
    socket.emit('admin_assign_points', { playerId, points: delta })
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Score Answers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {questionTitle && (
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30 mb-4">
            <div className="text-xl font-bold text-primary">{questionTitle}</div>
          </div>
        )}

        {answers.map((answer) => (
          <div key={answer.playerId} className="p-5 rounded-xl border-2 border-primary/20 bg-card/80 shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              {answer.profilePicture && (
                <img
                  src={answer.profilePicture}
                  alt={answer.playerNickname}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                />
              )}
              <div className="font-bold text-lg">{answer.playerNickname}</div>
            </div>
            <div className="space-y-2 mb-3">
              {Array.from({ length: answersPerQuestion }).map((_, fieldIndex) => {
                const answerText = answer.answers?.[fieldIndex] || ''
                return (
                  <div key={fieldIndex} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    <span className="font-semibold">Answer {fieldIndex + 1}:</span>{' '}
                    {answerText.trim() || <span className="italic">EMPTY</span>}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end gap-4">
              {isAdmin && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 rounded-full font-bold hover:scale-110 transition-all"
                    onClick={() => handlePointsChange(answer.playerId, -1)}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="text-2xl font-black w-16 text-center bg-primary/20 rounded-lg py-2 border border-primary/30">
                    {answer.points || 0}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 rounded-full font-bold hover:scale-110 transition-all"
                    onClick={() => handlePointsChange(answer.playerId, 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              )}
              {!isAdmin && (
                <div className="text-2xl font-black bg-primary/20 px-4 py-2 rounded-lg border border-primary/30">
                  {answer.points || 0} pts
                </div>
              )}
            </div>
          </div>
        ))}
        {isAdmin && (
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={() => socket.emit('admin_confirm_points')}
            >
              Confirm Points
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-bold text-lg h-14 border-2 hover:bg-primary/10 transition-all"
              onClick={() => socket.emit('admin_end_quiz')}
            >
              End Game
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PointsAwardedScreen
