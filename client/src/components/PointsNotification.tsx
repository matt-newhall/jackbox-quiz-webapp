import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  gifUrl: string
  points: number
  onClose: () => void
}

const PointsNotification = ({ gifUrl, points, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Great Job! +{points} Points!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={gifUrl}
              alt="Good job!"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            onClick={onClose}
            className="w-full font-bold text-lg h-12"
          >
            Awesome!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default PointsNotification
