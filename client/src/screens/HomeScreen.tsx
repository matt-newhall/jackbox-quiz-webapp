import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { handleImageUpload } from '@/utils/image'

type Props = {
  onJoinRoom: (roomCode: string, nickname: string, profilePicture?: string) => void
  onCreateRoom: (nickname: string, profilePicture?: string) => void
  setNickname: (val: string) => void
  setRoomCode: (val: string) => void
  setIsAdmin: (val: boolean) => void
  nickname: string
  roomCode: string
  isAdmin: boolean
  error: string | null
}

const HomeScreen = ({ onJoinRoom, onCreateRoom, setNickname, nickname, setRoomCode, roomCode, error }: Props) => {
  const [mode, setMode] = useState<'join' | 'create' | null>(null)
  const [profilePicture, setProfilePicture] = useState<string>('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setProfilePicture)
  }

  const handleJoin = () => {
    if (nickname && roomCode) {
      onJoinRoom(roomCode.toUpperCase(), nickname, profilePicture || undefined)
    }
  }

  const handleCreate = () => {
    if (nickname) {
      onCreateRoom(nickname, profilePicture || undefined)
    }
  }

  const triggerFileInput = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    input?.click()
  }

  if (mode === null) {
    return (
      <Card className="w-96 shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Music Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              {error}
            </div>
          )}
          <Button
            onClick={() => setMode('join')}
            className="w-full font-semibold text-lg h-12 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            size="lg"
          >
            Join Game
          </Button>
          <Button
            onClick={() => setMode('create')}
            className="w-full font-semibold text-lg h-12 border-2 hover:bg-primary/10 transition-all"
            variant="outline"
            size="lg"
          >
            Host Game
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (mode === 'join') {
    return (
      <Card className="w-96 shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Join Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-semibold mb-2 block">Nickname</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={20}
              className="h-11 text-base"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Room Code</label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="h-11 text-base font-mono tracking-wider"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Profile Picture (Optional)</label>
            <div className="flex items-center gap-3">
              {profilePicture && (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                />
              )}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={triggerFileInput}
                >
                  {profilePicture ? 'Change Picture' : 'Upload Picture'}
                </Button>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setMode(null)} variant="outline" className="flex-1 font-semibold">
              Back
            </Button>
            <Button onClick={handleJoin} className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all">
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-96 shadow-2xl border-2 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Host Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm font-semibold mb-2 block">Your Nickname</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            maxLength={20}
            className="h-11 text-base"
          />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">Profile Picture (Optional)</label>
          <div className="flex items-center gap-3">
            {profilePicture && (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
              />
            )}
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={triggerFileInput}
              >
                {profilePicture ? 'Change Picture' : 'Upload Picture'}
              </Button>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setMode(null)} variant="outline" className="flex-1 font-semibold">
            Back
          </Button>
          <Button onClick={handleCreate} className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all">
            Create Room
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default HomeScreen
