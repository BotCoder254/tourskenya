import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaRoute, FaBookmark, FaSignOutAlt, FaChevronLeft } from 'react-icons/fa';
import { useState } from 'react';
import { auth } from '../../config/firebase';

const AdminNav = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/tours', icon: <FaRoute />, label: 'Manage Tours' },
    { path: '/admin/bookings', icon: <FaBookmark />, label: 'Manage Bookings' },
  ];

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' }
  };

  return (
    <motion.nav
      className="fixed left-0 top-0 h-screen bg-white shadow-lg z-50 flex flex-col"
      initial="expanded"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <motion.span
            className="text-xl font-bold text-primary whitespace-nowrap"
            animate={{ opacity: isExpanded ? 1 : 0 }}
          >
            Admin Panel
          </motion.span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronLeft />
            </motion.div>
          </button>
        </div>
      </div>

      <div className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 mb-2 transition-colors duration-200 ${
              location.pathname === item.path
                ? 'text-primary bg-primary/10'
                : 'text-gray-600 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <motion.span
              className="ml-4 whitespace-nowrap"
              animate={{ opacity: isExpanded ? 1 : 0 }}
            >
              {item.label}
            </motion.span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt />
          <motion.span
            className="ml-4 whitespace-nowrap"
            animate={{ opacity: isExpanded ? 1 : 0 }}
          >
            Sign Out
          </motion.span>
        </button>
      </div>
    </motion.nav>
  );
};

export default AdminNav; 