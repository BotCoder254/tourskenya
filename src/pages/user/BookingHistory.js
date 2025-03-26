import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaCalendar, FaStar, FaMapMarkerAlt, FaHistory } from 'react-icons/fa';

const BookingHistoryCard = ({ booking }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 lg:w-56">
          <img
            src={booking.tour.imageUrl}
            alt={booking.tour.title}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {booking.tour.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{booking.tour.destination}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary font-semibold">${booking.totalAmount}</div>
                <div className="text-sm text-gray-500">per person</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <FaCalendar className="mr-2" />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaHistory className="mr-2" />
                <span>Completed on {formatDate(booking.completedAt)}</span>
              </div>
            </div>

            {booking.review ? (
              <div className="mt-auto">
                <div className="border-t pt-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= booking.review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      Reviewed on {formatDate(booking.review.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{booking.review.comment}</p>
                </div>
              </div>
            ) : (
              <div className="mt-auto">
                <div className="border-t pt-4">
                  <button className="btn-secondary w-full">Write a Review</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);

        const bookingsRef = collection(db, 'bookings');
        const q = query(
          bookingsRef,
          where('userId', '==', user.uid),
          where('status', '==', 'completed'),
          where('date', '>=', startDate),
          where('date', '<', endDate),
          orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching booking history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, year]);

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
          <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
          <p className="mt-2 text-gray-600">View your past tours and experiences</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="form-select"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BookingHistoryCard booking={booking} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No completed tours found
              </h3>
              <p className="text-gray-500">
                You don't have any completed tours for {year}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory; 