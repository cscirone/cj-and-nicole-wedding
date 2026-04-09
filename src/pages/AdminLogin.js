import { useEffect, useState } from 'react'
import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db } from '../firebase'
import { Card } from '../components/index'
import { useAuthUser } from '../context/AuthContext'

let adminAnonymousSignInPromise = null

export function AdminLogin() {
  const navigate = useNavigate()
  const { currentAdminDoc, setCurrentAdminDoc } = useAuthUser()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningInAnonymously, setIsSigningInAnonymously] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

      const createdInThisRun = !adminAnonymousSignInPromise
      try {
        if (isMounted) {
          setIsSigningInAnonymously(true)
        }
        if (createdInThisRun) {
          adminAnonymousSignInPromise = signInAnonymously(auth)
        }
        await adminAnonymousSignInPromise
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to start session.')
        }
      } finally {
        if (createdInThisRun) {
          adminAnonymousSignInPromise = null
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

  useEffect(() => {
    if (currentAdminDoc) {
      navigate('/home', { replace: true })
    }
  }, [currentAdminDoc, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const normalizedUsername = username.trim()
    const normalizedPassword = password.trim()
    if (!normalizedUsername || !normalizedPassword) {
      setErrorMessage('Username and password are required.')
      return
    }

    try {
      setIsSubmitting(true)
      const adminsRef = collection(db, 'admins')
      const adminQuery = query(
        adminsRef,
        where('username', '==', normalizedUsername),
        where('password', '==', normalizedPassword),
        limit(1)
      )
      const adminSnapshot = await getDocs(adminQuery)

      if (adminSnapshot.empty) {
        setErrorMessage('Invalid username or password.')
        return
      }

      const adminDoc = adminSnapshot.docs[0]
      setCurrentAdminDoc({
        id: adminDoc.id,
        ...adminDoc.data(),
      })
      navigate('/home', { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to complete admin login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSigningInAnonymously) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold">Admin login</h1>
        <p>Enter your admin credentials to continue.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Sign in as admin'}
          </Button>
        </form>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      </Card>
    </div>
  )
}
