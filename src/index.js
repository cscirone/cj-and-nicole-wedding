import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from './context/AuthContext'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7A5540',
      //main: '#ff0000'
    },
    secondary: {
      main: '#9C7459',
    },
    background: {
      default: '#CEB092',
      //default: '#18181b90'
      //default: '#0a0a0a'
    },
    text: {
      primary: '#2F241C',
      secondary: '#5A4A3D',
    },
    success: {
      main: '#22c55e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    /* MuiPaper: {
      styleOverrides: {
        outlined: {
          backgroundColor: '#F7F1EA',
          borderColor: '#B99A7B',
          color: '#2F241C',
          borderRadius: 12,
          boxShadow: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#2F241C',
          fontWeight: 600,
          '&:hover': {
            color: '#2F241C',
            backgroundColor: 'rgba(47, 36, 28, 0.08)',
          },
          '&.Mui-selected': {
            color: '#2F241C',
            backgroundColor: 'rgba(47, 36, 28, 0.12)',
          },
        },
      },
    }, */
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        }
      }
    }
  },
  cssVariables: true,
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
