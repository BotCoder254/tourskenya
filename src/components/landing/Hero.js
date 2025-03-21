import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { animations } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt, FaUserPlus, FaCompass, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { PERMISSIONS } from '../../config/roles';

const HERO_IMAGE = "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2072&auto=format&fit=crop";

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Navigation Bar */}
      <motion.nav
        className="absolute top-0 left-0 right-0 z-50 px-6 py-4 bg-black/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold">
            Kenya Tours
          </Link>
          <div className="flex items-center space-x-6">
            {!user && !isAdminRoute && (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-white hover:text-primary transition-colors duration-200"
                >
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full transition-colors duration-200"
                >
                  <FaUserPlus className="mr-2" />
                  Sign Up
                </Link>
              </>
            )}
            {user && !isAdminRoute && (
              <>
                <Link
                  to="/explore"
                  className="flex items-center text-white hover:text-primary transition-colors duration-200"
                >
                  <FaCompass className="mr-2" />
                  Explore Tours
                </Link>
                {hasPermission(PERMISSIONS.ACCESS_ADMIN) && (
                  <Link
                    to="/admin"
                    className="flex items-center bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full transition-colors duration-200"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <img
          src={HERO_IMAGE}
          alt="Kenya Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative h-full flex items-center justify-center text-center">
        <motion.div
          className="max-w-4xl px-6"
          initial={animations.fadeIn.initial}
          animate={animations.fadeIn.animate}
          transition={{ delay: 0.2, ...animations.fadeIn.transition }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Explore Kenya's Best Tours
          </motion.h1>
          
          <motion.p
            className="text-xl text-white/90 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Experience the magic of Kenya's wildlife, culture, and landscapes
          </motion.p>

          <Link to="/explore">
            <motion.button
              className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Tours
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="animate-bounce">
          <svg 
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero; 