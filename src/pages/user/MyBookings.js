import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaCalendar, FaUsers, FaClock, FaMapMarkerAlt, FaDownload } from 'react-icons/fa';

const BookingCard = ({ booking }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{booking.tour.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <FaCalendar className="mr-2" />
            <span>{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaUsers className="mr-2" />
            <span>{booking.groupSize} people</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaClock className="mr-2" />
            <span>{booking.tour.duration}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2" />
            <span>{booking.tour.destination}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-primary font-semibold">
            ${booking.totalAmount}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Booking ID: {booking.id}</p>
                  <p>Payment Method: {booking.paymentMethod}</p>
                  <p>Booked on: {formatDate(booking.createdAt)}</p>
                </div>
                <div className="mt-4">
                  <button className="btn-secondary flex items-center">
                    <FaDownload className="mr-2" />
                    Download Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your tour bookings</p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500">
                {filter === 'all'
                  ? "You haven't made any bookings yet"
                  : `You don't have any ${filter} bookings`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings; 