import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { Card } from '../components/index'
import { useAuthUser } from '../context/AuthContext'
import { db } from '../firebase'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

function createGuest() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    firstName: '',
    lastName: '',
    guestType: 'adult',
  }
}

const initialFormData = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  rsvpStatus: '',
  accommodationStatus: '',
  dietaryRestrictions: '',
  songRequest: '',
  notes: '',
}

export function RSVP() {
  const { uid, currentUserDoc } = useAuthUser()
  const currentUserDocId = currentUserDoc?.id
  const expectedPin = currentUserDoc?.pin || ''
  const [formData, setFormData] = useState(initialFormData)
  const [additionalGuests, setAdditionalGuests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [pinError, setPinError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    if (!currentUserDocId) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const loadExistingRsvp = async () => {
      try {
        const userRef = doc(db, 'users', currentUserDocId)
        const snapshot = await getDoc(userRef)

        if (!isMounted || !snapshot.exists()) {
          return
        }

        const data = snapshot.data()

        setFormData((previous) => ({
          ...previous,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          rsvpStatus: data.rsvpStatus || '',
          accommodationStatus: data.accommodationStatus || '',
          dietaryRestrictions: data.dietaryRestrictions || '',
          songRequest: data.songRequest || '',
          notes: data.notes || '',
        }))

        setAdditionalGuests(
          (data.additionalGuests || []).map((guest) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            firstName: guest.firstName || '',
            lastName: guest.lastName || '',
            guestType: guest.guestType || 'adult',
          }))
        )
      } catch (error) {
        if (isMounted) {
          setSubmitError(error.message || 'Unable to load your existing RSVP.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExistingRsvp()

    return () => {
      isMounted = false
    }
  }, [currentUserDocId])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleAddGuest = () => {
    setAdditionalGuests((previous) => [...previous, createGuest()])
  }

  const handleRemoveGuest = (guestId) => {
    setAdditionalGuests((previous) => previous.filter((guest) => guest.id !== guestId))
  }

  const handleGuestFieldChange = (guestId, field, value) => {
    setAdditionalGuests((previous) =>
      previous.map((guest) => (guest.id === guestId ? { ...guest, [field]: value } : guest))
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!currentUserDocId) {
      setSubmitError('You must be signed in to submit your RSVP.')
      return
    }

    const payload = {
      uid: currentUserDocId,
      authUid: uid ?? null,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      nameKey: `${formData.firstName.trim().toLowerCase()}|${formData.lastName.trim().toLowerCase()}`,
      phoneNumber: formData.phoneNumber.trim(),
      rsvpStatus: formData.rsvpStatus,
      accommodationStatus: formData.accommodationStatus,
      dietaryRestrictions: formData.dietaryRestrictions.trim(),
      songRequest: formData.songRequest.trim(),
      notes: formData.notes.trim(),
      additionalGuests: additionalGuests.map((guest) => ({
        firstName: guest.firstName.trim(),
        lastName: guest.lastName.trim(),
        guestType: guest.guestType,
      })),
      updatedAt: serverTimestamp(),
    }

    try {
      setIsSubmitting(true)
      const userRef = doc(db, 'users', currentUserDocId)
      const snapshot = await getDoc(userRef)

      if (!snapshot.exists()) {
        payload.createdAt = serverTimestamp()
      }

      await setDoc(userRef, payload, { merge: true })
      setSubmitSuccess('Your RSVP was saved successfully.')
    } catch (error) {
      setSubmitError(error.message || 'Unable to save your RSVP right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePinSubmit = (event) => {
    event.preventDefault()
    setPinError('')

    if (!expectedPin) {
      setPinError('No PIN is set for this guest profile yet. Please return to authentication.')
      return
    }

    if (enteredPin.trim() !== expectedPin) {
      setPinError('Incorrect PIN. Please try again.')
      return
    }

    setIsPinVerified(true)
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl justify-center py-12">
        <CircularProgress />
      </div>
    )
  }

  if (!isPinVerified) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <h1 className="text-2xl font-semibold">Enter PIN to edit RSVP</h1>
          <p>Please enter the 4-digit PIN for {currentUserDoc?.firstName || 'this guest'}.</p>

          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <TextField
              label="4-digit PIN"
              value={enteredPin}
              onChange={(event) => setEnteredPin(event.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
              Verify PIN
            </Button>
          </form>

          {pinError ? <Alert severity="error">{pinError}</Alert> : null}
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <h1 className="text-2xl font-semibold">RSVP</h1>
        <p>Please fill out the details below so we can plan your experience.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              name="firstName"
              label="First name"
              value={formData.firstName}
              onChange={handleFieldChange}
              required
              fullWidth
            />
            <TextField
              name="lastName"
              label="Last name"
              value={formData.lastName}
              onChange={handleFieldChange}
              required
              fullWidth
            />
          </div>

          <TextField
            name="phoneNumber"
            label="Phone number (optional)"
            value={formData.phoneNumber}
            onChange={handleFieldChange}
            autoComplete="tel"
            fullWidth
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Who else are you bringing?</h2>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddGuest}>
                Add guest
              </Button>
            </div>

            {additionalGuests.length === 0 ? (
              <p>No additional guests added yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {additionalGuests.map((guest, index) => (
                  <div key={guest.id} className="rounded-md border border-wedding-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-base font-medium">Guest {index + 1}</h3>
                      <IconButton
                        aria-label={`Remove guest ${index + 1}`}
                        color="error"
                        onClick={() => handleRemoveGuest(guest.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextField
                        label="First name"
                        value={guest.firstName}
                        onChange={(event) => handleGuestFieldChange(guest.id, 'firstName', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Last name"
                        value={guest.lastName}
                        onChange={(event) => handleGuestFieldChange(guest.id, 'lastName', event.target.value)}
                        fullWidth
                      />
                    </div>

                    <FormControl sx={{ mt: 2 }}>
                      <FormLabel>Guest type</FormLabel>
                      <RadioGroup
                        row
                        value={guest.guestType}
                        onChange={(event) => handleGuestFieldChange(guest.id, 'guestType', event.target.value)}
                      >
                        <FormControlLabel value="adult" control={<Radio />} label="Adult" />
                        <FormControlLabel value="child" control={<Radio />} label="Child" />
                      </RadioGroup>
                    </FormControl>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormControl>
            <FormLabel>RSVP status (required)</FormLabel>
            <RadioGroup name="rsvpStatus" value={formData.rsvpStatus} onChange={handleFieldChange} required>
              <FormControlLabel value="attending" control={<Radio />} label="Attending" />
              <FormControlLabel value="not_attending" control={<Radio />} label="Not attending" />
              <FormControlLabel value="unsure" control={<Radio />} label="Not sure" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Accommodation status (optional)</FormLabel>
            <RadioGroup name="accommodationStatus" value={formData.accommodationStatus} onChange={handleFieldChange}>
              <FormControlLabel value="ill_figure_it_out" control={<Radio />} label="I'll figure it out" />
              <FormControlLabel value="need_help" control={<Radio />} label="Need help" />
              <FormControlLabel value="unsure" control={<Radio />} label="Unsure" />
            </RadioGroup>
          </FormControl>

          <TextField
            name="dietaryRestrictions"
            label="Dietary restrictions / allergies (optional)"
            value={formData.dietaryRestrictions}
            onChange={handleFieldChange}
            multiline
            minRows={2}
            fullWidth
          />

          <TextField
            name="songRequest"
            label="Song request (optional)"
            value={formData.songRequest}
            onChange={handleFieldChange}
            fullWidth
          />

          <TextField
            name="notes"
            label="Notes for CJ & Nicole (optional)"
            value={formData.notes}
            onChange={handleFieldChange}
            multiline
            minRows={3}
            fullWidth
          />

          {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Submit RSVP'}
          </Button>
        </form>
      </Card>
    </div>
  )
}