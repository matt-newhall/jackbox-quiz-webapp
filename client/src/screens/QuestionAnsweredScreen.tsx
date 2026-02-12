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

const QuestionAnsweredScreen = ({
  answers,
  isAdmin,
  socket,
  answersPerQuestion = 1,
  questionTitle
}: Props) => {
  const handleRevealField = (fieldIndex: number) => {
    socket.emit('admin_reveal_answer_field', { fieldIndex })
  }

  const allFieldsRevealed = answers.length > 0 && answers.every(a => {
    if (!a.revealedFields) return false
    return a.revealedFields.length === answersPerQuestion && a.revealedFields.every(revealed => revealed === true)
  })

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Answers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionTitle && (
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="text-xl font-bold text-primary">{questionTitle}</div>
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: answersPerQuestion }).map((_, fieldIndex) => {
              const fieldRevealed = answers.length > 0 && answers.every(a =>
                a.revealedFields && a.revealedFields[fieldIndex] === true
              )
              return (
                <Button
                  key={fieldIndex}
                  onClick={() => handleRevealField(fieldIndex)}
                  variant={fieldRevealed ? "default" : "outline"}
                  disabled={fieldRevealed}
                  className="font-semibold"
                >
                  Reveal Field {fieldIndex + 1} {fieldRevealed && '✓'}
                </Button>
              )
            })}
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: answersPerQuestion }).map((_, fieldIndex) => (
            <div key={fieldIndex} className="space-y-2">
              <div className="text-lg font-bold text-primary mb-2">
                Answer {fieldIndex + 1}
              </div>
              {answers.map((answer) => {
                const answerText = answer.answers?.[fieldIndex] || ''
                const isRevealed = answer.revealedFields?.[fieldIndex] === true
                return (
                  <div
                    key={answer.playerId}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isRevealed
                        ? 'bg-muted/50 border-primary/30'
                        : 'bg-muted/20 border-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {answer.profilePicture && (
                          <img
                            src={answer.profilePicture}
                            alt={answer.playerNickname}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                          />
                        )}
                        <div className="font-semibold text-base text-muted-foreground uppercase tracking-wider">
                          {answer.playerNickname}
                        </div>
                      </div>
                      <div className={`text-base font-medium transition-opacity ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                        {isRevealed ? (
                          answerText.trim() ? (
                            answerText
                          ) : (
                            <span className="text-muted-foreground italic">EMPTY</span>
                          )
                        ) : (
                          '••••••'
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="mt-6">
            <Button
              onClick={() => socket.emit('admin_show_scores')}
              className="w-full font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
              disabled={!allFieldsRevealed}
            >
              {allFieldsRevealed ? 'Show Scores' : 'Reveal all answer fields to continue'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionAnsweredScreen
