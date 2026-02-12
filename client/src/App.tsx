import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import './App.css'
import HomeScreen from './screens/HomeScreen'
import GameRoom from './screens/GameRoom'
import type { Player, GameState } from '@shared/types'
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

const App = () => {
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialPlayers, setInitialPlayers] = useState<Player[]>([])
  const [initialGameState, setInitialGameState] = useState<GameState>('LOBBY')

  const handleJoinRoom = (code: string, name: string, profilePicture?: string) => {
    setError(null)
    const newSocket: SocketType = io(import.meta.env.VITE_SOCKET_URL)

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomCode: code, nickname: name, profilePicture })
      if (profilePicture) {
        setTimeout(() => {
          newSocket.emit('update_profile_picture', { profilePicture })
        }, 100)
      }
    })

    newSocket.on('game_state', ({ currentState }) => {
      setInitialGameState(currentState)
    })

    newSocket.on('players_updated', ({ players }) => {
      setInitialPlayers(players)
      if (!hasJoined) {
        setHasJoined(true)
        setRoomCode(code)
        setNickname(name)
        setSocket(newSocket)
      }
    })

    newSocket.on('error', ({ errorState }) => {
      let errorMsg = 'An error occurred'
      if (errorState === 'CODE_NOT_FOUND') {
        errorMsg = 'Room code not found'
      } else if (errorState === 'DUPLICATE_NICKNAME') {
        errorMsg = 'Nickname already taken'
      } else if (errorState === 'UNAUTHORIZED') {
        errorMsg = 'Unauthorized action'
      }
      setError(errorMsg)
      newSocket.disconnect()
    })
  }

  const handleCreateRoom = (name: string, profilePicture?: string) => {
    setError(null)
    const newSocket: SocketType = io(import.meta.env.VITE_SOCKET_URL)

    newSocket.on('room_created', ({ roomCode: code }) => {
      setRoomCode(code)
      setNickname(name)
      setIsAdmin(true)
      if (profilePicture) {
        newSocket.emit('update_profile_picture', { profilePicture })
      }
    })

    newSocket.on('game_state', ({ currentState }) => {
      setInitialGameState(currentState)
    })

    newSocket.on('players_updated', ({ players }) => {
      setInitialPlayers(players)
      if (!hasJoined) {
        setHasJoined(true)
        setSocket(newSocket)
      }
    })

    newSocket.on('error', () => {
      setError('Failed to create room')
      newSocket.disconnect()
    })

    newSocket.on('connect', () => {
      newSocket.emit('admin_create_room', { userId: newSocket.id || '', nickname: name, profilePicture })
    })
  }

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  if (hasJoined && socket) {
    return (
      <GameRoom
        socket={socket}
        roomCode={roomCode}
        isAdmin={isAdmin}
        initialPlayers={initialPlayers}
        initialGameState={initialGameState}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <HomeScreen
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        setNickname={setNickname}
        setRoomCode={setRoomCode}
        setIsAdmin={setIsAdmin}
        nickname={nickname}
        roomCode={roomCode}
        isAdmin={isAdmin}
        error={error}
      />
    </div>
  )
}

export default App
