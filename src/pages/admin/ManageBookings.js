import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaCheck, FaTimes, FaSpinner, FaFilter, FaSearch, FaCalendar, FaUser, FaMoneyBillWave, FaEllipsisV } from 'react-icons/fa';
import { animations } from '../../constants/theme';

const BookingStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const BookingCard = ({ booking, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 mb-4"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img
            src={booking.tour?.imageUrl}
            alt={booking.tour?.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{booking.tour?.title}</h3>
            <p className="text-gray-500">{booking.user?.email}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaEllipsisV className="text-gray-500" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onStatusChange(booking.id, 'confirmed');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <FaCheck className="mr-2 text-green-500" />
                  Confirm Booking
                </button>
                <button
                  onClick={() => {
                    onStatusChange(booking.id, 'cancelled');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <FaTimes className="mr-2 text-red-500" />
                  Cancel Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">
            {new Date(booking.date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold">${booking.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>
    </motion.div>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'bookings'));

      // Apply filters
      if (filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.dateRange !== 'all') {
        const date = new Date();
        if (filters.dateRange === 'today') {
          date.setHours(0, 0, 0, 0);
          q = query(q, where('date', '>=', date));
        } else if (filters.dateRange === 'week') {
          date.setDate(date.getDate() - 7);
          q = query(q, where('date', '>=', date));
        } else if (filters.dateRange === 'month') {
          date.setMonth(date.getMonth() - 1);
          q = query(q, where('date', '>=', date));
        }
      }

      q = query(q, orderBy(filters.sortBy, filters.sortOrder));

      const bookingsSnap = await getDocs(q);
      const bookingsData = await Promise.all(
        bookingsSnap.docs.map(async (doc) => {
          const booking = { id: doc.id, ...doc.data() };
          const tourDoc = await getDocs(doc(db, 'tours', booking.tourId));
          booking.tour = tourDoc.data();
          return booking;
        })
      );

      // Update stats
      const newStats = bookingsData.reduce((acc, booking) => {
        acc.total++;
        acc[booking.status]++;
        return acc;
      }, { total: 0, confirmed: 0, pending: 0, cancelled: 0 });

      setStats(newStats);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      className="p-6"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Bookings</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-500">Confirmed:</span>
            <span className="font-semibold">{stats.confirmed}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-yellow-500">Pending:</span>
            <span className="font-semibold">{stats.pending}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-500">Cancelled:</span>
            <span className="font-semibold">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="relative">
            <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ManageBookings; 