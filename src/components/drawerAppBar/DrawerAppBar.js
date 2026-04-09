import * as React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { Link } from 'react-router-dom'

const drawerWidth = 240
const navItems = [
  { name: 'Home', path: '/home' },
  { name: 'Details', path: '/details' },
  { name: 'RSVP', path: '/rsvp' },
]
const drawerItems = [
  ...navItems,
]
const title = 'CJ & Nicole\'s Wedding'

function DrawerAppBar(props) {
  const { window } = props
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState)
  }

  const handleLinkClick = () => {
    global.window.scrollTo({ top: 0, behavior: 'smooth' })
    if (mobileOpen) {
      handleDrawerToggle()
    }
  }

  const drawer = (
    <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: 'background.default' }}>
      <Typography variant="h6" sx={{ py: 2, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        {title}
      </Typography>

      <List sx={{ flexGrow: 1, minHeight: 0, gap: 2, display: 'flex', flexDirection: 'column', py: 0 }}>
        {drawerItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <Link to={item.path} key={item.name} className="nav-link" onClick={handleLinkClick} style={{ width: '100%' }}>
                <Button
                  variant="text"
                  sx={{
                    width: '100%',
                    color: 'text.primary',
                    borderRadius: 0,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  {item.name}
                </Button>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  const container = window !== undefined ? () => window().document.body : undefined

  return (
    <>
      <CssBaseline />
      <AppBar component="nav" position="sticky">
        <Toolbar sx={{ flexDirection: { xs: 'row', sm: 'column'} }} className="justify-between">
          <h1 className="nav-title">
            <Link to="/" onClick={handleLinkClick} className="text-nowrap truncate">
              {title}
            </Link>
          </h1>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>  

          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' }}}>
            {navItems.map((item) => (
              <Link to={item.path} key={item.name} onClick={handleLinkClick}>
                <Button
                  variant="text"
                  sx={(theme) => ({
                    color: 'primary.contrastText',
                    boxShadow: `inset 0 0 0 0 ${theme.palette.background.default}`,
                    transition: 'box-shadow 220ms ease, color 220ms ease',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      boxShadow: `inset 0 -3rem 0 0 ${theme.palette.background.default}`,
                      color: 'text.primary',
                    },
                  })}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </Stack>

        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  )
}

DrawerAppBar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
}

export { DrawerAppBar }