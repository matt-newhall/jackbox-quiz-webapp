import { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types'

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>
