import { Warning } from '@mui/icons-material'
import { Card } from '../../components/index'

export function HotelRecommendationsPanel() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Warning color="warning" />
        <h2>TBD</h2>
      </div>
      <p>This is a work in progress, please check back later for more information!</p>
    </Card>
  )
}
