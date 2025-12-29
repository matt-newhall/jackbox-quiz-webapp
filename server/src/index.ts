import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types'
import GameManager from './gameManager'

const app = express()
app.use(cors())

const port = 3000

const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const gameManager = new GameManager()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join_room', ({ roomCode, nickname }) => {
    const gameState = gameManager.getGameState(roomCode)
    const players = gameManager.getPlayers(roomCode) ?? []

    if (!socket.rooms.has(roomCode) || !gameState) {
      console.error(`User attempted to join room ${roomCode} - does not exist.`)
      socket.emit('error', { errorState: 'CODE_NOT_FOUND' })
      return
    }

    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode)

    if (socketsInRoom) {
      const nicknamesTaken = new Set<string>()

      socketsInRoom.forEach(socketId => {
        const existingSocket = io.sockets.sockets.get(socketId)

        if (existingSocket?.data.nickname) {
          nicknamesTaken.add(existingSocket.data.nickname.toLowerCase())
        }
      })

      if (nicknamesTaken.has(nickname.toLowerCase())) {
        socket.emit('error', { errorState: 'DUPLICATE_NICKNAME' })
        return
      }
    }

    console.log(`${nickname} joining room ${roomCode}`)

    socket.data.nickname = nickname
    socket.data.roomCode = roomCode
    socket.data.isAdmin = false

    socket.join(roomCode)
    gameManager.addPlayer({ roomCode, playerId: socket.id, playerNickname: nickname });

    socket.emit('game_state', { currentState: gameState })

    // Broadcast updated player list to everyone in room
    io.to(roomCode).emit('players_updated', { players });

  })

  socket.on('submit_answer', ({ roomCode, answer }) => {
    const playerId = socket.id
    gameManager.submitAnswer({ roomCode, answer, playerId })
  })

  socket.on('admin_create_room', ({ userId }) => {
    // TODO: check if userId is admin, if they can create room
    const roomCode = generateRoomCode()

    gameManager.createRoom(roomCode)
    gameManager.addPlayer({ roomCode, playerId: socket.id, playerNickname: 'admin', isAdmin: true })

    socket.data.isAdmin = true
    socket.data.roomCode = roomCode
    socket.join(roomCode)

    socket.emit('room_created', { roomCode })
  })

  socket.on('admin_ask_question', () => {
    const roomCode = socket.data.roomCode

    if (!socket.rooms.has(roomCode)) {
      socket.emit('error', { errorState: 'CODE_NOT_FOUND' })
      return
    }

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.clearAnswers(roomCode)
    gameManager.changeState(roomCode, 'QUESTION_ACTIVE')
    io.to(roomCode).emit('game_state', { currentState: 'QUESTION_ACTIVE' })
  })

  socket.on('admin_show_answers', () => {
    const roomCode = socket.data.roomCode

    if (!socket.rooms.has(roomCode)) {
      socket.emit('error', { errorState: 'CODE_NOT_FOUND' })
      return
    }

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    const answers = gameManager.getAnswers(roomCode)
    gameManager.changeState(roomCode, 'QUESTION_ANSWERED');
    io.to(roomCode).emit('game_state', { currentState: 'QUESTION_ANSWERED', answers })
  })

  socket.on('admin_assign_points', ({ pointsMap }) => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.assignPointsBatch(roomCode, pointsMap)
    const answers = gameManager.getAnswers(roomCode)
    io.to(roomCode).emit('scores_updated', { answers })
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)

    const roomCode = socket.data.roomCode
    const nickname = socket.data.nickname
    const wasAdmin = socket.data.isAdmin

    if (!roomCode) return

    gameManager.removePlayer(roomCode, socket.id)
    const players = gameManager.getPlayers(roomCode) ?? []

    if (wasAdmin) {
      io.to(roomCode).emit('game_state', {
        currentState: 'GAME_ENDED'
      })
    } else {
      socket.to(roomCode).emit('player_left', { nickname, players })
    }
  })
})

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})