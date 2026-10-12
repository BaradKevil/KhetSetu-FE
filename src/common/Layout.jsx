import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
        }}
      >
        {/* Common Top Header across all pages (mobile and desktop) */}
        <Navbar onToggleSidebar={isMobile ? handleDrawerToggle : undefined} />

        {(() => {
          const isFullPageChat = location.pathname.startsWith('/seller/ai-advisory');

          return (
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                px: isFullPageChat ? 0 : { xs: 2, sm: 3, md: 4 },
                py: isFullPageChat ? 0 : { xs: 2, sm: 2.5, md: 3.5 },
                maxWidth: '100%',
                overflowX: 'hidden',
                display: isFullPageChat ? 'flex' : 'block',
                flexDirection: isFullPageChat ? 'column' : 'initial',
                height: isFullPageChat ? { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 65px)' } : 'auto',
                minHeight: isFullPageChat ? 0 : 'auto',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={
                    isFullPageChat
                      ? { flex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0 }
                      : undefined
                  }
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
};

export default Layout;
