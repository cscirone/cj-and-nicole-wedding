import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './stylesheets/App.css'
import { 
  Authenticate, 
  AdminLogin,
  Details, 
  Home, 
  RSVP, 
  NotFound,
} from './pages/index'
import { DrawerAppBar } from './components/index'
import { useAuthUser } from './context/AuthContext'

function AppLayoutWithDrawer() {
  return (
    <>
      <DrawerAppBar />
      <main className={mainClassName}>
        <Outlet />
      </main>
    </>
  )
}

function RequireAuth() {
  const { isAuthenticated, loading, profileLoading, currentUserDoc, isAdmin } = useAuthUser()

  if (loading || profileLoading) {
    return null
  }

  if (!isAuthenticated || (!currentUserDoc && !isAdmin)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

const mainClassName = "p-4"

function App() {
  return (
    <div className="flex flex-col bg-wedding-background text-wedding-text">
      <Routes>
        <Route path="/" element={<main className={mainClassName}><Authenticate /></main>} />
        <Route path="/admin-login" element={<main className={mainClassName}><AdminLogin /></main>} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayoutWithDrawer />}>
            <Route path="/home" element={<main className={mainClassName}><Home /></main>} />
            <Route path="/details" element={<main className={mainClassName}><Details /></main>} />
            <Route path="/rsvp" element={<main className={mainClassName}><RSVP /></main>} />
          </Route>
        </Route>
        <Route path="*" element={<main className={mainClassName}><NotFound /></main>} />
      </Routes>
    </div>
  )
}

export default App
