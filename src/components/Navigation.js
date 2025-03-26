import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCompass, 
  FaHeart, 
  FaChevronLeft, 
  FaSignOutAlt, 
  FaUserCog,
  FaClipboardList,
  FaUsers,
  FaTachometerAlt,
  FaBars
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../config/roles';
import { auth } from '../config/firebase';

const Navigation = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      to: '/tours',
      icon: <FaCompass />,
      label: 'Explore Tours',
      permission: null // Available to all authenticated users
    },
    {
      to: '/wishlist',
      icon: <FaHeart />,
      label: 'Wishlist',
      permission: null
    },
    {
      to: '/admin',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      permission: PERMISSIONS.ACCESS_ADMIN
    },
    {
      to: '/admin/tours',
      icon: <FaClipboardList />,
      label: 'Manage Tours',
      permission: PERMISSIONS.MANAGE_TOURS
    },
    {
      to: '/admin/bookings',
      icon: <FaUsers />,
      label: 'Manage Bookings',
      permission: PERMISSIONS.MANAGE_BOOKINGS
    }
  ];

  const sidebarVariants = {
    expanded: {
      width: '240px',
      transition: {
        duration: 0.3
      }
    },
    collapsed: {
      width: '72px',
      transition: {
        duration: 0.3
      }
    }
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      display: 'block',
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      display: 'none',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.nav
      className="fixed left-0 top-0 h-screen bg-white shadow-lg z-50 flex flex-col"
      initial="expanded"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-primary text-white p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? <FaChevronLeft /> : <FaBars />}
        </motion.div>
      </button>

      {/* Logo */}
      <Link to="/" className="p-4 flex items-center space-x-4 mb-8">
        <img
          src="/logo.png"
          alt="Kenya Tours"
          className="w-8 h-8 rounded-full"
        />
        <motion.span
          variants={textVariants}
          className="font-bold text-gray-800 text-lg"
        >
          Kenya Tours
        </motion.span>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1 px-2">
        {navItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-4 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-primary/10'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <motion.span
                variants={textVariants}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <FaUserCog className="text-primary" />
          </div>
          <motion.div
            variants={textVariants}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.email}
            </p>
          </motion.div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-4 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt />
          <motion.span
            variants={textVariants}
            className="font-medium"
          >
            Sign Out
          </motion.span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navigation; 