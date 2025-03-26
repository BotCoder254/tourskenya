import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, query, orderBy, where, limit, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaCheck, FaTimes, FaFilter, FaSearch, FaCalendar, FaUser, FaMoneyBillWave, FaSortAmountDown, FaSortAmountUp, FaEye } from 'react-icons/fa';
import { animations } from '../../constants/theme';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import BookingDetails from '../../components/admin/BookingDetails';

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

const BookingRow = ({ booking, onStatusChange, onViewDetails }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              className="h-10 w-10 rounded-full" 
              src={booking.user?.photoURL || `https://ui-avatars.com/api/?name=${booking.user?.displayName || 'User'}&background=random`} 
              alt="" 
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{booking.user?.displayName || booking.user?.email}</div>
            <div className="text-sm text-gray-500">{booking.user?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              className="h-10 w-10 rounded object-cover" 
              src={booking.tour?.imageUrl || 'https://via.placeholder.com/40'} 
              alt="" 
            />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{booking.tour?.title || 'N/A'}</div>
            <div className="text-sm text-gray-500">
              <span className="mr-2">Group size: {booking.groupSize}</span>
              <span>{booking.tour?.duration || 0} days</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">${booking.amount?.toFixed(2) || '0.00'}</div>
        <div className="text-sm text-gray-500">{formatDate(booking.createdAt)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}>
          {booking.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-primary hover:text-primary-dark"
          >
            <FaEye className="w-5 h-5" />
          </button>
          {booking.status !== 'cancelled' && (
            <>
              {booking.status !== 'confirmed' && (
                <button
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                  className="text-green-600 hover:text-green-900"
                >
                  <FaCheck className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="text-red-600 hover:text-red-900"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, sortBy, startDate, endDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let bookingsQuery = collection(db, 'bookings');
      
      // Apply filters
      if (filterStatus !== 'all') {
        bookingsQuery = query(bookingsQuery, where('status', '==', filterStatus));
      }
      
      if (startDate && endDate) {
        bookingsQuery = query(
          bookingsQuery, 
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        );
      }

      // Apply sorting
      bookingsQuery = query(bookingsQuery, orderBy(sortBy === 'date' ? 'createdAt' : 'amount', 'desc'));

      const bookingsSnap = await getDocs(bookingsQuery);
      const bookingsData = await Promise.all(
        bookingsSnap.docs.map(async (bookingDoc) => {
          const booking = { id: bookingDoc.id, ...bookingDoc.data() };
          
          // Fetch tour details
          if (booking.tourId) {
            const tourDocRef = doc(db, 'tours', booking.tourId);
            const tourDocSnap = await getDoc(tourDocRef);
            if (tourDocSnap.exists()) {
              booking.tour = { id: tourDocSnap.id, ...tourDocSnap.data() };
            }
          }

          // Fetch user details
          if (booking.userId) {
            const userDocRef = doc(db, 'users', booking.userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              booking.user = { id: userDocSnap.id, ...userDocSnap.data() };
            }
          }

          return booking;
        })
      );

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update the tour's booking count if status changes to confirmed
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && booking.tourId) {
        const tourRef = doc(db, 'tours', booking.tourId);
        const tourSnap = await getDoc(tourRef);
        if (tourSnap.exists()) {
          const currentBookings = tourSnap.data().bookings || 0;
          await updateDoc(tourRef, {
            bookings: newStatus === 'confirmed' ? currentBookings + 1 : Math.max(0, currentBookings - 1)
          });
        }
      }
      
      toast.success(`Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleViewDetails = (booking) => {
    // Implement the logic to view booking details
  };

  const handleFilterChange = (name, value) => {
    // Implement the logic to handle filter changes
  };

  const toggleSortOrder = () => {
    handleFilterChange('sortOrder', filterStatus === 'all' ? 'asc' : 'desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Manage Bookings</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all tour bookings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaFilter className="mr-2" />
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="End Date"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tour Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount & Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <BookingRow 
                        key={booking.id} 
                        booking={booking} 
                        onStatusChange={handleStatusChange}
                        onViewDetails={setSelectedBooking}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBookings; 