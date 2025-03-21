import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { animations } from '../../constants/theme';

const BookingSuccess = ({ booking }) => {
  return (
    <motion.div
      className="w-full max-w-md mx-auto text-center"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <FaCheckCircle className="w-16 h-16 mx-auto text-green-500" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Booking Confirmed!
        </h2>

        <p className="text-gray-600 mb-6">
          Thank you for booking with us. Your tour is confirmed and we've sent you an email with all the details.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-gray-600">Booking ID</p>
              <p className="font-semibold">{booking.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Tour Date</p>
              <p className="font-semibold">
                {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Group Size</p>
              <p className="font-semibold">{booking.groupSize} people</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold text-green-500">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/explore"
            className="block w-full bg-primary hover:bg-secondary text-white py-3 rounded-lg transition-colors duration-200"
          >
            Book Another Tour
          </Link>
          <Link
            to="/"
            className="block w-full border border-primary text-primary hover:bg-gray-50 py-3 rounded-lg transition-colors duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingSuccess; 