import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaUsers, FaCreditCard } from 'react-icons/fa';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { animations } from '../../constants/theme';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = ({ tour, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState({
    date: new Date(),
    groupSize: 1,
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);

  const handleDateChange = (date) => {
    setBooking(prev => ({ ...prev, date }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBooking(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        userId: user.uid,
        tourId: tour.id,
        ...booking,
        date: booking.date.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className={`flex items-center ${number < step ? 'text-primary' : number === step ? 'text-secondary' : 'text-gray-300'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              number < step ? 'border-primary bg-primary text-white' :
              number === step ? 'border-secondary bg-secondary text-white' :
              'border-gray-300'
            }`}>
              {number}
            </div>
            {number < 3 && (
              <div className={`w-full h-1 mx-2 ${number < step ? 'bg-primary' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold mb-4">Select Date</h3>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Tour Date</label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <DatePicker
                selected={booking.date}
                onChange={handleDateChange}
                minDate={new Date()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Group Size */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold mb-4">Group Details</h3>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Number of People</label>
            <div className="relative">
              <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="groupSize"
                min="1"
                max="20"
                value={booking.groupSize}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Special Requests</label>
            <textarea
              name="specialRequests"
              value={booking.specialRequests}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
            />
          </div>
        </motion.div>
      )}

      {/* Step 3: Summary */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Tour</p>
                <p className="font-semibold">{tour.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{booking.date.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Group Size</p>
                <p className="font-semibold">{booking.groupSize} people</p>
              </div>
              <div>
                <p className="text-gray-600">Total Price</p>
                <p className="font-semibold">${tour.price * booking.groupSize}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4">
                <p className="text-gray-600">Special Requests</p>
                <p className="font-semibold">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={nextStep}
            className="ml-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-200"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BookingForm; 