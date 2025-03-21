import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaCheck, FaTimes, FaFilter, FaSearch, FaCalendar, FaUser, FaMoneyBillWave, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { animations } from '../../constants/theme';

const BookingStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
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
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};

const BookingCard = ({ booking, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 relative"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <img
            src={booking.tour?.imageUrl || 'https://via.placeholder.com/64'}
            alt={booking.tour?.title || 'Tour'}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-lg">{booking.tour?.title || 'Unknown Tour'}</h3>
            <p className="text-gray-600">{booking.user?.email || 'Unknown User'}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                <FaCalendar className="inline mr-2" />
                {formatDate(booking.date)}
              </p>
              <p className="text-sm text-gray-500">
                <FaUser className="inline mr-2" />
                {booking.groupSize || 1} {booking.groupSize === 1 ? 'person' : 'people'}
              </p>
              <p className="text-sm text-gray-500">
                <FaMoneyBillWave className="inline mr-2" />
                ${booking.amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <BookingStatusBadge status={booking.status} />
          {showActions && booking.status !== 'cancelled' && (
            <div className="flex space-x-2">
              {booking.status !== 'confirmed' && (
                <button
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-200"
                >
                  <FaCheck />
                </button>
              )}
              <button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FaTimes />
              </button>
            </div>
          )}
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
    cancelled: 0,
    revenue: 0
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
          q = query(q, where('date', '>=', date.toISOString()));
        } else if (filters.dateRange === 'week') {
          date.setDate(date.getDate() - 7);
          q = query(q, where('date', '>=', date.toISOString()));
        } else if (filters.dateRange === 'month') {
          date.setMonth(date.getMonth() - 1);
          q = query(q, where('date', '>=', date.toISOString()));
        }
      }

      // Apply sorting
      q = query(q, orderBy(filters.sortBy, filters.sortOrder));

      const bookingsSnap = await getDocs(q);
      const bookingsData = await Promise.all(
        bookingsSnap.docs.map(async (doc) => {
          const booking = { id: doc.id, ...doc.data() };
          if (booking.tourId) {
            const tourDoc = await getDocs(doc(db, 'tours', booking.tourId));
            if (tourDoc.exists()) {
              booking.tour = tourDoc.data();
            }
          }
          return booking;
        })
      );

      // Calculate stats
      const newStats = bookingsData.reduce((acc, booking) => {
        acc.total++;
        acc[booking.status]++;
        if (booking.status === 'confirmed') {
          acc.revenue += booking.amount || 0;
        }
        return acc;
      }, { total: 0, confirmed: 0, pending: 0, cancelled: 0, revenue: 0 });

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

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <motion.div
      className="p-6"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Manage Bookings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-green-500">Confirmed</p>
            <p className="text-2xl font-bold">{stats.confirmed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-yellow-500">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-red-500">Cancelled</p>
            <p className="text-2xl font-bold">{stats.cancelled}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-primary">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            onClick={toggleSortOrder}
            className="flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            <span>{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Bookings List */}
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
          {bookings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ManageBookings; 