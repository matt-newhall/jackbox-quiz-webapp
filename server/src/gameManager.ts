import { GameState, Room } from "../../shared/types";

type SubmittedAnswer = {
  roomCode: string;
  playerId: string;
  answer: string;
}

type NewPlayer = {
  roomCode: string;
  playerId: string;
  playerNickname: string;
  isAdmin?: boolean;
}

class GameManager {
  private rooms: Map<string, Room> = new Map();

  submitAnswer({ roomCode, playerId, answer }: SubmittedAnswer) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)
    if (!player) return

    room.currentAnswers.push({ playerId, answer, playerNickname: player.nickname })
  }

  getAnswers(roomCode: string) {
    return this.rooms.get(roomCode)?.currentAnswers || [];
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

  createRoom(roomCode: string) {
    this.rooms.set(roomCode, {
      code: roomCode,
      state: 'LOBBY',
      players: [],
      currentAnswers: []
    })
  }

  removePlayer(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    const player = room.players.find(p => p.id === playerId)

    if (player?.isAdmin) {
      room.state = 'GAME_ENDED'
    }

    room.players = room.players.filter(p => p.id !== playerId)

    if (room.players.length === 0) {
      this.rooms.delete(roomCode)
    }
  }

  assignPointsBatch(roomCode: string, pointsMap: Record<string, number>) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    Object.entries(pointsMap).forEach(([playerId, points]) => {
      const player = room.players.find(p => p.id === playerId)
      if (player) {
        player.score += points
      }

      const answer = room.currentAnswers.find(a => a.playerId === playerId)
      if (answer) {
        answer.points = points
      }
    })
  }

  clearAnswers(roomCode: string) {
    const room = this.rooms.get(roomCode)
    if (!room) return

    room.currentAnswers = []
  }
}

export default GameManager
