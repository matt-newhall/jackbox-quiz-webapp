export type GameState = 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_ANSWERED' | 'POINTS_AWARDED' | 'STANDINGS' | 'GAME_ENDED'

export type ErrorState = 'DUPLICATE_NICKNAME' | 'CODE_NOT_FOUND' | 'UNAUTHORIZED'

export interface Player {
  id: string;
  nickname: string;
  score: number;
  isAdmin: boolean;
  profilePicture?: string;
}

export interface Answer {
  answers: string[];
  playerId: string;
  playerNickname: string;
  profilePicture?: string;
  points?: number;
  revealedFields?: boolean[];
}

export interface Room {
  code: string;
  state: GameState;
  players: Player[];
  currentAnswers: Answer[];
  adminNickname?: string;
  answersPerQuestion?: number;
  questionTitle?: string;
}


// Socket event types
export interface ServerToClientEvents {
  room_created: (data: { roomCode: string }) => void;
  game_state: (game: { currentState: GameState; answers?: Answer[]; answersPerQuestion?: number; questionTitle?: string }) => void;
  error: (data: { errorState: ErrorState }) => void;
  player_left: (data: { nickname: string; players: Player[] }) => void;
  players_updated: (data: { players: Player[] }) => void;
  scores_updated: (data: { answers: Answer[] }) => void;
  answer_field_revealed: (data: { fieldIndex: number; answers: Answer[] }) => void;
  final_scores: (data: { players: Player[] }) => void;
  points_notification: (data: { gifUrl: string; points: number }) => void;
  standings_updated: (data: { players: Player[] }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { roomCode: string; nickname: string; isAdmin?: boolean; profilePicture?: string }) => void;
  admin_create_room: (data: { userId: string; nickname?: string; profilePicture?: string }) => void;
  admin_ask_question: (data: { answersPerQuestion?: number; questionTitle?: string }) => void;
  admin_show_answers: () => void;
  admin_reveal_answer_field: (data: { fieldIndex: number }) => void;
  admin_show_scores: () => void;
  admin_assign_points: (data: { playerId: string; points: number }) => void;
  admin_confirm_points: () => void;
  admin_end_quiz: () => void;
  submit_answer: (data: { roomCode: string; answers: string[] }) => void;
  update_profile_picture: (data: { profilePicture: string }) => void;
}