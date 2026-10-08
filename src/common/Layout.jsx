import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAF9' }}>
      <Navbar onToggleSidebar={isMobile ? handleDrawerToggle : undefined} />

      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar
          open={mobileOpen}
          onClose={handleDrawerToggle}
          isMobile={isMobile}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 3.5 },
            py: { xs: 2, sm: 2.5, md: 3 },
            width: { md: `calc(100% - 260px)` },
            minHeight: 'calc(100vh - 64px)',
            maxWidth: '100%',
            overflowX: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
