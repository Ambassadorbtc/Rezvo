import { useState } from 'react'
import Card from '../../components/shared/Card'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Calendar</h1>
        <p className="text-text-secondary">
          View and manage your bookings
        </p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">
            Calendar view coming soon
          </p>
          <p className="text-sm text-text-tertiary">
            Timeline view with drag-and-drop booking management
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Calendar
