import { Card, ScrollableTabs } from '../components/index'
import { Button } from '@mui/material'
import { Event } from '@mui/icons-material'
import {
    LocationPanel,
    HotelRecommendationsPanel,
    DinnerMenuPanel,
    FaqPanel,
} from './detailsPanels/index'

export function Details() {
    const tabs = [
        { label: 'Location', index: 0, panel: <LocationPanel /> },
        { label: 'Hotel Recommendations', index: 1, panel: <HotelRecommendationsPanel /> },
        { label: 'Dinner Menu', index: 2, panel: <DinnerMenuPanel /> },
        { label: 'FAQ', index: 3, panel: <FaqPanel /> },

    ]

    return (
        <div className="flex flex-col gap-4">
            <h1>Wedding Details</h1>

            <Card>
                <h2>Date & Time</h2>
                <p>5:30 PM - 11:00 PM on <strong>Saturday, August 29th, 2026</strong></p>
                <Button variant="contained" color="primary" startIcon={<Event />}>Add to Calendar</Button>
            </Card>

            <Card>
                <ScrollableTabs tabs={tabs} name="details" />
            </Card>
        </div>
    )
}