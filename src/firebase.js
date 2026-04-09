import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'cj-and-nicole-wedding.firebaseapp.com',
  projectId: 'cj-and-nicole-wedding',
  storageBucket: 'cj-and-nicole-wedding.firebasestorage.app',
  messagingSenderId: '133505397458',
  appId: '1:133505397458:web:1314f1c73cb5c12fe3330b',
  measurementId: 'G-S2QD63C17T',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

let analytics
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app)
  }
})

export { app, auth, db, analytics }