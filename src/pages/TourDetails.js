import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaCalendar, FaClock, FaUsers, FaStar, FaHeart, FaShare } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const tourDoc = await getDoc(doc(db, 'tours', id));
        if (tourDoc.exists()) {
          setTour({ id: tourDoc.id, ...tourDoc.data() });
        } else {
          navigate('/tours');
        }
      } catch (error) {
        console.error('Error fetching tour details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tour) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-900">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              {tour.title}
            </motion.h1>
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span>{tour.rating} ({tour.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center">
                <FaUsers className="mr-1" />
                <span>{tour.groupSize} people max</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-1" />
                <span>{tour.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Tour Overview</h2>
              <p className="text-gray-600 mb-6">{tour.description}</p>

              <h3 className="text-xl font-semibold mb-4">Highlights</h3>
              <ul className="list-disc list-inside text-gray-600 mb-6">
                {tour.highlights?.map((highlight, index) => (
                  <li key={index} className="mb-2">{highlight}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold mb-4">Included</h3>
              <ul className="grid grid-cols-2 gap-4 text-gray-600">
                {tour.included?.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
              <div className="space-y-6">
                {tour.itinerary?.map((day, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold text-lg mb-2">Day {index + 1}</h3>
                    <p className="text-gray-600">{day}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl font-bold text-primary">
                    ${tour.price}
                    <span className="text-sm text-gray-500 font-normal">/person</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <FaHeart className={isWishlisted ? 'text-red-500' : 'text-gray-400'} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <FaShare className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {tour.availableDates?.map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 text-sm rounded-md border ${
                          selectedDate === date
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        {new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!selectedDate}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4">Tour Guide</h3>
                <div className="flex items-center">
                  <img
                    src={tour.guide?.photoUrl}
                    alt={tour.guide?.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-medium">{tour.guide?.name}</div>
                    <div className="text-sm text-gray-500">{tour.guide?.experience} years experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails; 