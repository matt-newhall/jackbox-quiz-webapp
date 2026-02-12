import { Answer, GameState, Room } from "../../shared/types";

type SubmittedAnswer = {
  roomCode: string;
  playerId: string;
  answers: string[];
}

type NewPlayer = {
  roomCode: string;
  playerId: string;
  playerNickname: string;
  isAdmin?: boolean;
}

class GameManager {
  private rooms: Map<string, Room> = new Map();

  submitAnswer({ roomCode, playerId, answers }: SubmittedAnswer) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)
    if (!player) return

    const answersPerQuestion = room.answersPerQuestion || 1
    // Ensure answers array matches expected length
    const paddedAnswers = [...answers]
    while (paddedAnswers.length < answersPerQuestion) {
      paddedAnswers.push('')
    }

    // Check if answer already exists for this player
    const existingAnswer = room.currentAnswers.find(a => a.playerId === playerId)
    if (existingAnswer) {
      existingAnswer.answers = paddedAnswers.slice(0, answersPerQuestion)
      // Always update profile picture and nickname from player in case they changed
      existingAnswer.profilePicture = player.profilePicture
      existingAnswer.playerNickname = player.nickname
    } else {
      room.currentAnswers.push({ 
        playerId, 
        answers: paddedAnswers.slice(0, answersPerQuestion),
        playerNickname: player.nickname, 
        profilePicture: player.profilePicture,
        revealedFields: new Array(answersPerQuestion).fill(false),
        points: 0 
      })
    }
  }

  getAnswers(roomCode: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return []

    const answersPerQuestion = room.answersPerQuestion || 1

    // Ensure all players (except admin) have an answer entry
    const allAnswers = [...room.currentAnswers]
    const nonAdminPlayers = room.players.filter(p => !p.isAdmin)

    nonAdminPlayers.forEach(player => {
      const existingAnswer = allAnswers.find(a => a.playerId === player.id)
      if (!existingAnswer) {
        // Create empty answer entry for players who didn't submit
        allAnswers.push({
          playerId: player.id,
          playerNickname: player.nickname,
          profilePicture: player.profilePicture,
          answers: new Array(answersPerQuestion).fill(''),
          revealedFields: new Array(answersPerQuestion).fill(false),
          points: 0
        })
      } else {
        // Update existing answer with latest player info (nickname and profile picture)
        existingAnswer.playerNickname = player.nickname
        existingAnswer.profilePicture = player.profilePicture
        // Ensure answers array matches expected length
        if (!existingAnswer.answers || existingAnswer.answers.length !== answersPerQuestion) {
          const currentAnswers = existingAnswer.answers || []
          existingAnswer.answers = [...currentAnswers]
          while (existingAnswer.answers.length < answersPerQuestion) {
            existingAnswer.answers.push('')
          }
          existingAnswer.answers = existingAnswer.answers.slice(0, answersPerQuestion)
        }
        // Ensure revealedFields array matches
        if (!existingAnswer.revealedFields || existingAnswer.revealedFields.length !== answersPerQuestion) {
          existingAnswer.revealedFields = new Array(answersPerQuestion).fill(false)
        }
      }
    })

    return allAnswers
  }

  changeState(roomCode: string, newState: GameState) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    room.state = newState;
  }

  addPlayer({ roomCode, playerId, playerNickname, isAdmin = false }: NewPlayer) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    room.players.push({ id: playerId, nickname: playerNickname, score: 0, isAdmin })
  }

  updateProfilePicture(roomCode: string, playerId: string, profilePicture: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    const player = room.players.find(p => p.id === playerId)
    if (player) {
      player.profilePicture = profilePicture
    }
  }

  getGameState(roomCode: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    return room.state
  }

  getPlayers(roomCode: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    return room.players
  }

  isAdmin(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    const admin = room.players.find(p => p.isAdmin === true)
    if (!admin) return

    return admin.id === playerId
  }

  createRoom(roomCode: string, adminNickname?: string) {
    this.rooms.set(roomCode, {
      code: roomCode,
      state: 'LOBBY',
      players: [],
      currentAnswers: [],
      adminNickname,
      answersPerQuestion: 1
    })
  }

  setAnswersPerQuestion(roomCode: string, count: number) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    room.answersPerQuestion = Math.max(1, count)
  }

  getAnswersPerQuestion(roomCode: string): number {
    const room = this.rooms.get(roomCode)
    return room?.answersPerQuestion || 1
  }

  getAdminNickname(roomCode: string): string | undefined {
    return this.rooms.get(roomCode)?.adminNickname
  }

  isAdminNickname(roomCode: string, nickname: string): boolean {
    const room = this.rooms.get(roomCode)
    if (!room || !room.adminNickname) return false
    return room.adminNickname.toLowerCase() === nickname.toLowerCase()
  }

  removePlayer(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    room.players = room.players.filter(p => p.id !== playerId)

    if (room.players.length === 0 && !room.adminNickname) {
      this.rooms.delete(roomCode)
    }
  }

  revealAnswerField(roomCode: string, fieldIndex: number) {
    const room = this.rooms.get(roomCode)
    if (!room) return []

    const answersPerQuestion = room.answersPerQuestion || 1
    if (fieldIndex < 0 || fieldIndex >= answersPerQuestion) return []

    room.currentAnswers.forEach(answer => {
      if (!answer.revealedFields) {
        answer.revealedFields = new Array(answersPerQuestion).fill(false)
      }

      answer.revealedFields[fieldIndex] = true
    })

    return room.currentAnswers
  }

  assignPoints(roomCode: string, playerId: string, pointsDelta: number) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)
    if (player) {
      player.score += pointsDelta
    }

    const answersPerQuestion = room.answersPerQuestion || 1
    let answer = room.currentAnswers.find(a => a.playerId === playerId)
    
    // If answer doesn't exist, create an empty one
    if (!answer) {
      answer = {
        playerId,
        playerNickname: player?.nickname || 'Unknown',
        profilePicture: player?.profilePicture,
        answers: new Array(answersPerQuestion).fill(''),
        revealedFields: new Array(answersPerQuestion).fill(true), // Already in points screen, so consider all revealed
        points: 0
      }
      room.currentAnswers.push(answer)
    } else {
      // Sync profile picture and nickname from player
      if (player) {
        answer.profilePicture = player.profilePicture
        answer.playerNickname = player.nickname
      }
      // Ensure revealedFields is set
      if (!answer.revealedFields) {
        answer.revealedFields = new Array(answersPerQuestion).fill(true)
      }
    }
    
    answer.points = (answer.points || 0) + pointsDelta
  }

  allAnswersRevealed(roomCode: string): boolean {
    const room = this.rooms.get(roomCode)
    if (!room) return false
  
    const answersPerQuestion = room.answersPerQuestion || 1
    const nonAdminPlayers = room.players.filter(p => !p.isAdmin)
  
    if (nonAdminPlayers.length === 0) return false
  
    return nonAdminPlayers.every(player => {
      const answer = room.currentAnswers.find(a => a.playerId === player.id)
      if (!answer || !answer.revealedFields) return false
  
      // Ensure revealedFields length matches expected
      if (answer.revealedFields.length !== answersPerQuestion) return false
  
      // All fields must be true
      return answer.revealedFields.every(field => field === true)
    })
  }

  setCurrentAnswers(roomCode: string, answers: Answer[]) {
    const room = this.rooms.get(roomCode)
    if (!room) return
    room.currentAnswers = answers
  }

  clearAnswers(roomCode: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    room.currentAnswers = []
  }
}

export default GameManager
