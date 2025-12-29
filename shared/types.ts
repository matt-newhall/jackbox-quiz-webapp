export type GameState = 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_ANSWERED' | 'POINTS_AWARDED' | 'GAME_ENDED'

export type ErrorState = 'DUPLICATE_NICKNAME' | 'CODE_NOT_FOUND' | 'UNAUTHORIZED'

export interface Player {
  id: string;
  nickname: string;
  score: number;
  isAdmin: boolean;
}

export interface Answer {
  answer: string;
  playerId: string;
  playerNickname: string;
  points?: number;
}

export interface Room {
  code: string;
  state: GameState;
  players: Player[];
  currentAnswers: Answer[];
}


// Socket event types
export interface ServerToClientEvents {
  room_created: (data: { roomCode: string }) => void;
  game_state: (game: { currentState: GameState; answers?: Answer[] }) => void;
  error: (data: { errorState: ErrorState }) => void;
  player_left: (data: { nickname: string; players: Player[] }) => void;
  players_updated: (data: { players: Player[] }) => void;
  scores_updated: (data: { answers: Answer[] }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomCode: string; nickname: string; isAdmin?: boolean }) => void;
  admin_create_room: (data: { userId: string }) => void;
  admin_ask_question: () => void;
  admin_show_answers: () => void;
  admin_assign_points: (data: { pointsMap: Record<string, number>}) => void;
  submit_answer: (data: { roomCode: string; answer: string }) => void;
}