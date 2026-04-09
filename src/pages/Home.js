import { Card } from '../components/index'
import { useAuthUser } from '../context/AuthContext'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { HelpOutline } from '@mui/icons-material'
import { GuestList } from './GuestList'

export function Home() {
    const { currentUserDoc, currentAdminDoc, setCurrentUserDoc, setCurrentAdminDoc } = useAuthUser()
    const firstName = currentUserDoc?.firstName || 'Guest'
    const rsvpStatus = currentUserDoc?.rsvpStatus || ''
    const adminLabel = currentAdminDoc?.username || 'Admin'
    const isAdmin = Boolean(currentAdminDoc)

    const handleSwitchUser = () => {
        setCurrentUserDoc(null)
        setCurrentAdminDoc(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="break-words font-cursive">Hello, {isAdmin ? adminLabel : firstName}!</h1>
                <Link to="/" onClick={handleSwitchUser} className="w-full sm:w-auto">
                    <Button variant="contained" color="secondary" className="flex w-full items-center gap-2 sm:w-auto">
                        <HelpOutline fontSize="small" /> Not you?
                    </Button>
                </Link>
            </div>

            {isAdmin ? (
                <Card>
                    <h2>Guest List</h2>
                    <p>Expand a row to view the full RSVP details for a guest.</p>
                    <GuestList />
                </Card>
            ) : rsvpStatus === 'attending' || rsvpStatus === 'not_attending' || rsvpStatus === 'unsure' ? (
                <Card>
                    <h2>Your RSVP is {rsvpStatus}</h2>
                    <p>Please click the button below to update your RSVP.</p>
                    <Link to="/rsvp" className="w-full">
                        <Button variant="contained" color="primary" className="w-full">Update RSVP</Button>
                    </Link>
                </Card>
            ) : (
                <Card>
                    <h2>CJ Scirone & Nicole Tupas are excited to invite you to their wedding!</h2>
                    <p>Please click the button below to RSVP.</p>
                    <Link to="/rsvp" className="w-full">
                        <Button variant="contained" color="primary" className="w-full">RSVP</Button>
                    </Link>
                </Card>
            )}
        </div>
    )
}