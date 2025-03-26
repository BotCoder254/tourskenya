import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaCalendar, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaDownload } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import BookingPDF from './BookingPDF';

const BookingDetails = ({ booking, onClose }) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Booking Details
                  </h3>
                  <PDFDownloadLink
                    document={<BookingPDF booking={booking} />}
                    fileName={`booking-${booking.id}.pdf`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {({ loading }) => (
                      <button
                        className="inline-flex items-center px-3 py-2 border border-primary rounded-md shadow-sm text-sm font-medium text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        disabled={loading}
                      >
                        <FaDownload className="mr-2" />
                        {loading ? 'Loading...' : 'Download PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tour</h4>
                      <p className="mt-1 text-sm text-gray-900">{booking.tour?.title}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.user?.displayName || booking.user?.email}</p>
                      <p className="text-sm text-gray-500">{booking.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Booking Date</p>
                      <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaClock className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-500">{booking.tour?.duration} days</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-500">{booking.tour?.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaMoneyBillWave className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Amount</p>
                      <p className="text-sm text-gray-500">${booking.amount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetails; 