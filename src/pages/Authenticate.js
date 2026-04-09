import { useEffect, useState } from 'react'
import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { addDoc, collection, limit, query, serverTimestamp, where, getDocs } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { useAuthUser } from '../context/AuthContext'
import { auth, db } from '../firebase'
import { Card } from '../components/index'

let anonymousSignInPromise = null

function buildNameKey(firstName, lastName) {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}`
}

export function Authenticate() {
    const navigate = useNavigate()
    const { isAuthenticated, loading, currentUserDoc, isAdmin, setCurrentUserDoc } = useAuthUser()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [pin, setPin] = useState('')
    const [pendingUser, setPendingUser] = useState(null)
    const [flowStep, setFlowStep] = useState('identify')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSigningInAnonymously, setIsSigningInAnonymously] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let isMounted = true

        const ensureAnonymousSession = async () => {
            if (auth.currentUser) {
                if (isMounted) {
                    setIsSigningInAnonymously(false)
                }
                return
            }

            const createdInThisRun = !anonymousSignInPromise
            try {
                if (isMounted) {
                    setIsSigningInAnonymously(true)
                }
                if (createdInThisRun) {
                    anonymousSignInPromise = signInAnonymously(auth)
                }
                await anonymousSignInPromise
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error.message || 'Unable to start anonymous session.')
                }
            } finally {
                if (createdInThisRun) {
                    anonymousSignInPromise = null
                }
                if (isMounted) {
                    setIsSigningInAnonymously(false)
                }
            }
        }

        ensureAnonymousSession()

        return () => {
            isMounted = false
        }
    }, [])

    if (loading || isSigningInAnonymously) {
        return (
            <div className="flex flex-col gap-4 h-screen items-center justify-center">
                <h1>Signing in...</h1>
                <CircularProgress />
            </div>
        )
    }

    const handleIdentifySubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')

        const normalizedFirstName = firstName.trim()
        const normalizedLastName = lastName.trim()
        if (!normalizedFirstName || !normalizedLastName) {
            setErrorMessage('First name and last name are required.')
            return
        }

        try {
            setIsSubmitting(true)
            const nameKey = buildNameKey(normalizedFirstName, normalizedLastName)
            const usersRef = collection(db, 'users')
            const matchingUserQuery = query(usersRef, where('nameKey', '==', nameKey), limit(1))
            const matchingSnapshot = await getDocs(matchingUserQuery)

            if (!matchingSnapshot.empty) {
                const existingUserDoc = matchingSnapshot.docs[0]
                setCurrentUserDoc({
                    id: existingUserDoc.id,
                    ...existingUserDoc.data(),
                })
                navigate('/home', { replace: true })
                return
            }
            setPendingUser({
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                nameKey,
            })
            setFlowStep('createPin')
        } catch (error) {
            setErrorMessage(error.message || 'Unable to continue right now.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateUserSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage('')

        if (!pendingUser) {
            setErrorMessage('Please start by entering your name.')
            setFlowStep('identify')
            return
        }

        if (!/^\d{4}$/.test(pin.trim())) {
            setErrorMessage('PIN must be exactly 4 digits.')
            return
        }

        try {
            setIsSubmitting(true)
            const usersRef = collection(db, 'users')

            const createdUserPayload = {
                uid: auth.currentUser?.uid ?? null,
                firstName: pendingUser.firstName,
                lastName: pendingUser.lastName,
                nameKey: pendingUser.nameKey,
                pin: pin.trim(),
                phoneNumber: '',
                rsvpStatus: '',
                accommodationStatus: '',
                dietaryRestrictions: '',
                songRequest: '',
                notes: '',
                additionalGuests: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }

            const createdUserRef = await addDoc(usersRef, createdUserPayload)
            setCurrentUserDoc({
                id: createdUserRef.id,
                ...createdUserPayload,
            })
            navigate('/home', { replace: true })
        } catch (error) {
            setErrorMessage(error.message || 'Unable to create your profile right now.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isAuthenticated) {
        return null
    }

    if (currentUserDoc || isAdmin) {
        return <Navigate to="/home" replace />
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-full max-w-lg">
                <h1 className="text-2xl font-semibold">Who are you?</h1>
                {flowStep === 'identify' ? (
                    <>
                        <p>Please enter your name so we can find your guest profile.</p>
                        <form onSubmit={handleIdentifySubmit} className="flex flex-col gap-4">
                            <TextField
                                label="First name"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Last name"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                                required
                                fullWidth
                            />

                            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Continue'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <p>
                            We could not find an existing guest profile for {pendingUser?.firstName} {pendingUser?.lastName}.
                            Set a 4-digit PIN so you can edit your RSVP later, make sure to make it something you can remember.
                        </p>
                        <form onSubmit={handleCreateUserSubmit} className="flex flex-col gap-4">
                            <TextField
                                label="4-digit PIN"
                                value={pin}
                                onChange={(event) => setPin(event.target.value)}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
                                required
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Create profile'}
                            </Button>
                            <Button
                                type="button"
                                variant="text"
                                color="secondary"
                                disabled={isSubmitting}
                                onClick={() => {
                                    setFlowStep('identify')
                                    setPendingUser(null)
                                    setPin('')
                                    setErrorMessage('')
                                }}
                            >
                                Go back
                            </Button>
                        </form>
                    </>
                )}

                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                <Link to="/admin-login">
                    <Button type="button" variant="outlined" color="secondary" fullWidth>
                        Admin login
                    </Button>
                </Link>
            </Card>
        </div>
    )
}