import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types'
import GameManager from './gameManager'
import { generateRoomCode } from './utils'

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

  socket.on('join_room', ({ roomCode, nickname, profilePicture }) => {
    const gameState = gameManager.getGameState(roomCode)

    if (!gameState) {
      console.error(`User attempted to join room ${roomCode} - does not exist.`)
      socket.emit('error', { errorState: 'CODE_NOT_FOUND' })
      return
    }

    // Check if this nickname is the admin trying to rejoin
    const isAdminRejoin = gameManager.isAdminNickname(roomCode, nickname)
    
    // Check if there's already an admin in the room
    const players = gameManager.getPlayers(roomCode) ?? []
    const hasActiveAdmin = players.some(p => p.isAdmin)

    // If admin is rejoining and there's no active admin, allow it
    // Otherwise, check for duplicate nicknames normally
    if (!isAdminRejoin || hasActiveAdmin) {
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
    }

    console.log(`${nickname} joining room ${roomCode}${isAdminRejoin ? ' (admin rejoin)' : ''}`)

    socket.data.nickname = nickname
    socket.data.roomCode = roomCode
    socket.data.isAdmin = isAdminRejoin && !hasActiveAdmin

    socket.join(roomCode)
    gameManager.addPlayer({ 
      roomCode, 
      playerId: socket.id, 
      playerNickname: nickname,
      isAdmin: isAdminRejoin && !hasActiveAdmin
    });
    
    // Set profile picture if provided
    if (profilePicture) {
      gameManager.updateProfilePicture(roomCode, socket.id, profilePicture)
    }

    const updatedPlayers = gameManager.getPlayers(roomCode) ?? []
    socket.emit('game_state', { currentState: gameState })

    // Broadcast updated player list to everyone in room
    io.to(roomCode).emit('players_updated', { players: updatedPlayers });

  })

  socket.on('submit_answer', ({ roomCode, answers }) => {
    const playerId = socket.id
    gameManager.submitAnswer({ roomCode, answers, playerId })
  })

  socket.on('admin_create_room', ({ userId, nickname, profilePicture }) => {
    // TODO: check if userId is admin, if they can create room
    const roomCode = generateRoomCode()
    const adminNickname = nickname || 'admin'

    gameManager.createRoom(roomCode, adminNickname)
    gameManager.addPlayer({ roomCode, playerId: socket.id, playerNickname: adminNickname, isAdmin: true })
    
    // Set profile picture if provided
    if (profilePicture) {
      gameManager.updateProfilePicture(roomCode, socket.id, profilePicture)
    }

    socket.data.isAdmin = true
    socket.data.roomCode = roomCode
    socket.data.nickname = adminNickname
    socket.join(roomCode)

    const players = gameManager.getPlayers(roomCode) ?? []
    const gameState = gameManager.getGameState(roomCode)

    socket.emit('room_created', { roomCode })
    if (gameState) {
      socket.emit('game_state', { currentState: gameState })
    }
    socket.emit('players_updated', { players })
  })

  socket.on('admin_ask_question', ({ answersPerQuestion = 1 }) => {
    const roomCode = socket.data.roomCode

    if (!socket.rooms.has(roomCode)) {
      socket.emit('error', { errorState: 'CODE_NOT_FOUND' })
      return
    }

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.setAnswersPerQuestion(roomCode, answersPerQuestion)
    gameManager.clearAnswers(roomCode)
    gameManager.changeState(roomCode, 'QUESTION_ACTIVE')
    io.to(roomCode).emit('game_state', { currentState: 'QUESTION_ACTIVE', answersPerQuestion })
  })

  socket.on('admin_show_answers', () => {
    const roomCode = socket.data.roomCode
  
    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }
  
    const answers = gameManager.getAnswers(roomCode)
  
    // 🔥 Persist them so reveal works correctly
    gameManager.setCurrentAnswers(roomCode, answers)
  
    const answersPerQuestion = gameManager.getAnswersPerQuestion(roomCode)
  
    gameManager.changeState(roomCode, 'QUESTION_ANSWERED')
  
    io.to(roomCode).emit('game_state', { 
      currentState: 'QUESTION_ANSWERED', 
      answers, 
      answersPerQuestion 
    })
  })

  socket.on('admin_reveal_answer_field', ({ fieldIndex }) => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    const answers = gameManager.revealAnswerField(roomCode, fieldIndex)
    io.to(roomCode).emit('answer_field_revealed', { fieldIndex, answers })
  })

  socket.on('admin_show_scores', () => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.changeState(roomCode, 'POINTS_AWARDED')
    const answers = gameManager.getAnswers(roomCode)
    io.to(roomCode).emit('game_state', { currentState: 'POINTS_AWARDED', answers })
  })

  socket.on('admin_assign_points', ({ playerId, points }) => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.assignPoints(roomCode, playerId, points)
    const answers = gameManager.getAnswers(roomCode)
    io.to(roomCode).emit('scores_updated', { answers })
  })

  socket.on('admin_confirm_points', () => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    // Array of awesome Spongebob celebration gifs - different for each player!
    // Using reliable Giphy URLs that should work consistently
    const spongebobGifs = [
      'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif', // Spongebob excited
      'https://media.tenor.com/x0mf7OwUqP0AAAAi/squidward-yell-spongebob.gif'
    ]

    // Get all answers and send notifications to players who got positive points
    const answers = gameManager.getAnswers(roomCode)
    const playersWithPoints = answers.filter(a => (a.points || 0) > 0)
    
    // Shuffle the gifs so each player gets a different one
    const shuffledGifs = [...spongebobGifs].sort(() => Math.random() - 0.5)
    
    // Get all sockets in the room to find the correct socket for each player
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode)
    
    playersWithPoints.forEach((answer, index) => {
      // Find the socket by matching the playerId
      let playerSocket = null
      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          const s = io.sockets.sockets.get(socketId)
          if (s && s.id === answer.playerId) {
            playerSocket = s
            break
          }
        }
      }
      
      // Fallback: try direct lookup
      if (!playerSocket) {
        playerSocket = io.sockets.sockets.get(answer.playerId)
      }
      
      if (playerSocket) {
        const gifUrl = shuffledGifs[index % shuffledGifs.length]
        console.log(`Sending notification to ${answer.playerNickname} (${answer.playerId}): ${gifUrl}`)
        playerSocket.emit('points_notification', { 
          gifUrl, 
          points: answer.points || 0 
        })
      } else {
        console.log(`Could not find socket for player ${answer.playerNickname} (${answer.playerId})`)
      }
    })

    gameManager.changeState(roomCode, 'STANDINGS')
    const players = gameManager.getPlayers(roomCode) ?? []
    io.to(roomCode).emit('game_state', { currentState: 'STANDINGS' })
    io.to(roomCode).emit('standings_updated', { players })
  })

  socket.on('update_profile_picture', ({ profilePicture }) => {
    const roomCode = socket.data.roomCode
    if (!roomCode) return

    gameManager.updateProfilePicture(roomCode, socket.id, profilePicture)
    const players = gameManager.getPlayers(roomCode) ?? []
    
    // Also update any existing answers for this player
    const answers = gameManager.getAnswers(roomCode)
    const updatedAnswers = answers.map(answer => {
      if (answer.playerId === socket.id) {
        return { ...answer, profilePicture }
      }
      return answer
    })
    
    io.to(roomCode).emit('players_updated', { players })
    // Emit updated answers if there are any
    if (updatedAnswers.length > 0) {
      io.to(roomCode).emit('scores_updated', { answers: updatedAnswers })
    }
  })

  socket.on('admin_end_quiz', () => {
    const roomCode = socket.data.roomCode

    if (!gameManager.isAdmin(roomCode, socket.id)) {
      socket.emit('error', { errorState: 'UNAUTHORIZED' })
      return
    }

    gameManager.changeState(roomCode, 'GAME_ENDED')
    const players = gameManager.getPlayers(roomCode) ?? []
    io.to(roomCode).emit('game_state', { currentState: 'GAME_ENDED' })
    io.to(roomCode).emit('final_scores', { players })
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)

    const roomCode = socket.data.roomCode
    const nickname = socket.data.nickname
    const wasAdmin = socket.data.isAdmin

    if (!roomCode) return

    gameManager.removePlayer(roomCode, socket.id)
    const players = gameManager.getPlayers(roomCode) ?? []

    // Don't end the game when admin leaves - they can rejoin
    // Just notify other players that someone left
    socket.to(roomCode).emit('player_left', { nickname, players })
  })
})

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})