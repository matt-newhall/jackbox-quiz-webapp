import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SocketType } from '@/types/socket'

type Props = {
  roomCode: string
  socket: SocketType
  isAdmin: boolean
  answersPerQuestion?: number
  questionTitle?: string
}

const QuestionActiveScreen = ({
  roomCode,
  socket,
  isAdmin,
  answersPerQuestion = 1,
  questionTitle
}: Props) => {
  const [submitted, setSubmitted] = useState(false)

  const [userAnswers, setUserAnswers] = useState<string[]>(() => new Array(answersPerQuestion || 1).fill(''))

  const currentAnswersPerQuestion = answersPerQuestion || 1
  if (userAnswers.length !== currentAnswersPerQuestion) {
    setUserAnswers(new Array(currentAnswersPerQuestion).fill(''))
    setSubmitted(false)
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
  }

  const handleSubmit = () => {
    const trimmedAnswers = userAnswers.map(a => a.trim()).filter(a => a.length > 0)
    if (trimmedAnswers.length > 0) {
      const paddedAnswers = [...userAnswers]
      while (paddedAnswers.length < currentAnswersPerQuestion) {
        paddedAnswers.push('')
      }
      socket.emit('submit_answer', { roomCode, answers: paddedAnswers.slice(0, currentAnswersPerQuestion) })
      setSubmitted(true)
    }
  }

  const allAnswersFilled = userAnswers.slice(0, currentAnswersPerQuestion).some(a => a.trim().length > 0)

  const handleShowAnswers = () => {
    socket.emit('admin_show_answers')
  }

  if (isAdmin) {
    return (
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Question Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionTitle && (
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
              <div className="text-xl font-bold text-primary">{questionTitle}</div>
            </div>
          )}
          <div className="text-center text-muted-foreground text-lg">
            Players are submitting their answers...
          </div>
          <Button
            onClick={handleShowAnswers}
            className="w-full font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            size="lg"
          >
            Show Answers
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Answer Submitted!</CardTitle>
        </CardHeader>
        <CardContent>
          {questionTitle && (
            <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30 mb-4">
              <div className="text-lg font-semibold text-primary">{questionTitle}</div>
            </div>
          )}
          <div className="text-center text-muted-foreground text-lg">
            Waiting for other players to submit their answers...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Submit Your Answer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionTitle && (
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="text-xl font-bold text-primary">{questionTitle}</div>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: currentAnswersPerQuestion }).map((_, index) => (
            <div key={index}>
              <Input
                value={userAnswers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder={`Answer ${index + 1}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allAnswersFilled) {
                    handleSubmit()
                  }
                }}
                className="text-lg h-14"
                autoFocus={index === 0}
              />
            </div>
          ))}
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full font-bold text-lg h-14 shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
          disabled={!allAnswersFilled}
        >
          Submit {currentAnswersPerQuestion > 1 ? 'Answers' : 'Answer'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default QuestionActiveScreen
