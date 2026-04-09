import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)
const USER_DOC_ID_STORAGE_KEY = 'currentUserDocId'
const ADMIN_DOC_ID_STORAGE_KEY = 'currentAdminDocId'

function AuthProvider({ children }) {
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [currentUserDoc, setCurrentUserDocState] = useState(null)
  const [currentAdminDoc, setCurrentAdminDocState] = useState(null)

  const setCurrentUserDoc = useCallback((nextDoc) => {
    setCurrentUserDocState(nextDoc)
    if (nextDoc?.id) {
      setCurrentAdminDocState(null)
      window.localStorage.removeItem(ADMIN_DOC_ID_STORAGE_KEY)
    }

    if (nextDoc?.id) {
      window.localStorage.setItem(USER_DOC_ID_STORAGE_KEY, nextDoc.id)
    } else {
      window.localStorage.removeItem(USER_DOC_ID_STORAGE_KEY)
    }
  }, [])

  const setCurrentAdminDoc = useCallback((nextDoc) => {
    setCurrentAdminDocState(nextDoc)
    if (nextDoc?.id) {
      setCurrentUserDocState(null)
      window.localStorage.removeItem(USER_DOC_ID_STORAGE_KEY)
    }

    if (nextDoc?.id) {
      window.localStorage.setItem(ADMIN_DOC_ID_STORAGE_KEY, nextDoc.id)
    } else {
      window.localStorage.removeItem(ADMIN_DOC_ID_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (!firebaseUser) {
        setCurrentUserDoc(null)
        setCurrentAdminDoc(null)
        setProfileLoading(false)
      }
    })

    return unsubscribe
  }, [setCurrentAdminDoc, setCurrentUserDoc])

  useEffect(() => {
    let isMounted = true

    const loadSelectedUserDoc = async () => {
      if (!user) {
        if (isMounted) {
          setProfileLoading(false)
        }
        return
      }

      const selectedAdminDocId = window.localStorage.getItem(ADMIN_DOC_ID_STORAGE_KEY)
      const selectedUserDocId = window.localStorage.getItem(USER_DOC_ID_STORAGE_KEY)
      if (!selectedAdminDocId && !selectedUserDocId) {
        if (isMounted) {
          setCurrentUserDocState(null)
          setCurrentAdminDocState(null)
          setProfileLoading(false)
        }
        return
      }

      try {
        setProfileLoading(true)
        if (selectedAdminDocId) {
          const adminRef = doc(db, 'admins', selectedAdminDocId)
          const adminSnapshot = await getDoc(adminRef)

          if (!isMounted) {
            return
          }

          if (adminSnapshot.exists()) {
            setCurrentAdminDocState({
              id: adminSnapshot.id,
              ...adminSnapshot.data(),
            })
            setCurrentUserDocState(null)
            return
          }

          setCurrentAdminDoc(null)
        }

        if (selectedUserDocId) {
          const userRef = doc(db, 'users', selectedUserDocId)
          const userSnapshot = await getDoc(userRef)

          if (!isMounted) {
            return
          }

          if (userSnapshot.exists()) {
            setCurrentUserDocState({
              id: userSnapshot.id,
              ...userSnapshot.data(),
            })
            setCurrentAdminDocState(null)
          } else {
            setCurrentUserDoc(null)
          }
        }
      } catch (error) {
        if (isMounted) {
          setCurrentUserDocState(null)
          setCurrentAdminDocState(null)
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false)
        }
      }
    }

    loadSelectedUserDoc()

    return () => {
      isMounted = false
    }
  }, [user, setCurrentUserDoc])

  const value = useMemo(
    () => ({
      user,
      uid: user?.uid ?? null,
      isAuthenticated: Boolean(user),
      isAnonymous: user?.isAnonymous ?? false,
      loading,
      profileLoading,
      currentUserDoc,
      currentUserDocId: currentUserDoc?.id ?? null,
      currentAdminDoc,
      currentAdminDocId: currentAdminDoc?.id ?? null,
      isAdmin: Boolean(currentAdminDoc),
      setCurrentUserDoc,
      setCurrentAdminDoc,
    }),
    [user, loading, profileLoading, currentUserDoc, currentAdminDoc, setCurrentAdminDoc, setCurrentUserDoc]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuthUser() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthUser must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider, useAuthUser }
