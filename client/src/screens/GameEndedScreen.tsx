import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Player } from '@shared/types'

type Props = {
  players: Player[]
}

const GameEndedScreen = ({ players }: Props) => {
  const nonAdminPlayers = players.filter(p => !p.isAdmin)
  const sortedPlayers = [...nonAdminPlayers].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Final Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {winner && (
          <div className="text-center mb-8 animate-bounce">
            <Trophy className="h-24 w-24 mx-auto mb-4 text-yellow-400 drop-shadow-lg" />
            <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              {winner.nickname} Wins!
            </div>
            <div className="text-2xl font-bold text-muted-foreground">{winner.score} points</div>
          </div>
        )}
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-5 rounded-xl transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-500 shadow-xl scale-105'
                  : 'bg-muted/50 border-2 border-primary/10 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-black w-12 ${index === 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  #{index + 1}
                </div>
                {player.profilePicture && (
                  <img
                    src={player.profilePicture}
                    alt={player.nickname}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
                  />
                )}
                <div className={`font-bold text-lg ${index === 0 ? 'text-yellow-100' : ''}`}>{player.nickname}</div>
              </div>
              <div className={`text-2xl font-black ${index === 0 ? 'text-yellow-400' : ''}`}>
                {player.score} pts
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default GameEndedScreen
