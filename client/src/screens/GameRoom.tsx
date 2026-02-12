import { useState, useEffect } from 'react'
import type { GameState, Player, Answer } from '@shared/types'
import type { SocketType } from '@/types/socket'
import LobbyScreen from './LobbyScreen'
import QuestionActiveScreen from './QuestionActiveScreen'
import QuestionAnsweredScreen from './QuestionAnsweredScreen'
import PointsAwardedScreen from './PointsAwardedScreen'
import StandingsScreen from './StandingsScreen'
import GameEndedScreen from './GameEndedScreen'
import PointsNotification from '@/components/PointsNotification'

type Props = {
  socket: SocketType
  roomCode: string
  isAdmin: boolean
  initialPlayers?: Player[]
  initialGameState?: GameState
}

const GameRoom = ({
  socket,
  roomCode,
  isAdmin: initialIsAdmin,
  initialPlayers: initialPlayersProp = [],
  initialGameState: initialGameStateProp = 'LOBBY'
}: Props) => {
  const [gameState, setGameState] = useState<GameState>(initialGameStateProp)
  const [players, setPlayers] = useState<Player[]>(initialPlayersProp)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [notification, setNotification] = useState<{ gifUrl: string; points: number } | null>(null)
  const [answersPerQuestion, setAnswersPerQuestion] = useState(1)
  const [questionTitle, setQuestionTitle] = useState<string | undefined>(undefined)

  useEffect(() => {
    socket.on('game_state', ({ currentState, answers: newAnswers, answersPerQuestion: newAnswersPerQuestion, questionTitle: newQuestionTitle }) => {
      setGameState(currentState)
      console.log(answers)
      console.log(currentState)
      if (newAnswers !== undefined) {
        setAnswers(newAnswers)
      }
      if (newAnswersPerQuestion !== undefined) {
        setAnswersPerQuestion(newAnswersPerQuestion)
      }
      if (newQuestionTitle !== undefined) {
        setQuestionTitle(newQuestionTitle)
      }
    })

    socket.on('players_updated', ({ players: newPlayers }) => {
      setPlayers(newPlayers)
      const adminPlayer = newPlayers.find(p => p.id === socket.id)
      if (adminPlayer) {
        setIsAdmin(adminPlayer.isAdmin)
      }
    })

    socket.on('answer_field_revealed', ({ answers: updatedAnswers }) => {
      setAnswers(updatedAnswers)
    })

    socket.on('scores_updated', ({ answers: newAnswers }) => {
      setAnswers(newAnswers)
    })

    socket.on('final_scores', ({ players: finalPlayers }) => {
      setPlayers(finalPlayers)
    })

    socket.on('standings_updated', ({ players: standingsPlayers }) => {
      setPlayers(standingsPlayers)
    })

    socket.on('points_notification', ({ gifUrl, points }) => {
      setNotification({ gifUrl, points })
    })

    socket.on('error', ({ errorState }) => {
      console.error('Error:', errorState)
    })

    return () => {
      socket.off('game_state')
      socket.off('players_updated')
      socket.off('answer_field_revealed')
      socket.off('scores_updated')
      socket.off('final_scores')
      socket.off('standings_updated')
      socket.off('points_notification')
      socket.off('error')
    }
  }, [socket])

  const renderScreen = () => {
    switch (gameState) {
      case 'LOBBY':
        return <LobbyScreen roomCode={roomCode} players={players} isAdmin={isAdmin} socket={socket} />
      case 'QUESTION_ACTIVE':
        return <QuestionActiveScreen roomCode={roomCode} socket={socket} isAdmin={isAdmin} answersPerQuestion={answersPerQuestion} questionTitle={questionTitle} />
      case 'QUESTION_ANSWERED':
        return <QuestionAnsweredScreen answers={answers} isAdmin={isAdmin} socket={socket} answersPerQuestion={answersPerQuestion} questionTitle={questionTitle} />
      case 'POINTS_AWARDED':
        return <PointsAwardedScreen answers={answers} isAdmin={isAdmin} socket={socket} answersPerQuestion={answersPerQuestion} questionTitle={questionTitle} />
      case 'STANDINGS':
        return <StandingsScreen players={players} isAdmin={isAdmin} socket={socket} />
      case 'GAME_ENDED':
        return <GameEndedScreen players={players} />
      default:
        return <div>Unknown state</div>
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {renderScreen()}
      {notification && (
        <PointsNotification
          gifUrl={notification.gifUrl}
          points={notification.points}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default GameRoom
