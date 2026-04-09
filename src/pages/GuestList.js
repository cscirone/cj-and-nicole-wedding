import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HelpIcon from '@mui/icons-material/Help'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function formatTimestamp(value) {
  if (!value) {
    return 'N/A'
  }

  try {
    if (typeof value.toDate === 'function') {
      return value.toDate().toLocaleString()
    }

    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString()
    }
  } catch (error) {
    return 'N/A'
  }

  return 'N/A'
}

function getDisplayValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided'
  }
  return value
}

function DetailField({ label, value }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 1.25,
        backgroundColor: 'rgba(247, 241, 234, 0.7)',
      }}
    >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {label}
        </Typography>
        <p>
            {value === 'Not provided' ? (<i className="text-gray-500">{value}</i>) : (value)}
        </p>
    </Box>
  )
}

function GuestRow({ guest, open, onToggle }) {
  const fullName = `${getDisplayValue(guest.firstName)} ${getDisplayValue(guest.lastName)}`.trim()
  const rsvpStatus = guest.rsvpStatus

  const renderRsvpStatus = () => {
    if (rsvpStatus === 'attending') {
      return <CheckCircleIcon color="success" />
    }

    if (rsvpStatus === 'not_attending') {
      return <CancelIcon color="error" />
    }

    if (rsvpStatus === 'unsure') {
      return <HelpIcon sx={{ color: '#d4a017' }} />
    }

    return <i className="text-gray-500">Not provided</i>
  }

  return (
    <Fragment>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton aria-label="expand row" size="small" onClick={onToggle}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{fullName}</TableCell>
        <TableCell>{renderRsvpStatus()}</TableCell>
        <TableCell>{formatTimestamp(guest.updatedAt)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Additional details
              </Typography>
              <Box className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DetailField label="Phone number" value={getDisplayValue(guest.phoneNumber)} />
                <DetailField label="Accommodation status" value={getDisplayValue(guest.accommodationStatus)} />
                <DetailField
                  label="Dietary restrictions / allergies"
                  value={getDisplayValue(guest.dietaryRestrictions)}
                />
                <DetailField label="Song request" value={getDisplayValue(guest.songRequest)} />
                <DetailField label="Notes" value={getDisplayValue(guest.notes)} />
                <DetailField
                  label="Additional guests"
                  value={
                    guest.additionalGuests?.length
                      ? guest.additionalGuests
                          .map(
                            (additionalGuest) =>
                              `${getDisplayValue(additionalGuest.firstName)} ${getDisplayValue(
                                additionalGuest.lastName
                              )} (${getDisplayValue(additionalGuest.guestType)})`
                          )
                          .join(', ')
                      : 'None'
                  }
                />
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export function GuestList() {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [guests, setGuests] = useState([])
  const [openGuestId, setOpenGuestId] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadGuests = async () => {
      try {
        setErrorMessage('')
        const usersSnapshot = await getDocs(collection(db, 'users'))
        if (!isMounted) {
          return
        }

        const nextGuests = usersSnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }))
        setGuests(nextGuests)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load guest list.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGuests()

    return () => {
      isMounted = false
    }
  }, [])

  const sortedGuests = useMemo(
    () =>
      [...guests].sort((a, b) => {
        const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0
        const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0
        return bDate - aDate
      }),
    [guests]
  )

  if (isLoading) {
    return (
      <Box className="flex justify-center py-6">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className="flex flex-col gap-3">
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#fff' }} />
              <TableCell sx={{ backgroundColor: '#fff' }}>Name</TableCell>
              <TableCell sx={{ backgroundColor: '#fff' }}>RSVP status</TableCell>
              <TableCell sx={{ backgroundColor: '#fff' }}>Updated at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedGuests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No guests found.
                </TableCell>
              </TableRow>
            ) : (
              sortedGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  open={openGuestId === guest.id}
                  onToggle={() => setOpenGuestId((previous) => (previous === guest.id ? null : guest.id))}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}