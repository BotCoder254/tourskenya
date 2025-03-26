import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, startAfter, getDocs, where, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaStar, FaUsers, FaCalendarAlt, FaCheck, FaHeart } from 'react-icons/fa';
import { animations, colors } from '../constants/theme';
import debounce from 'lodash/debounce';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ITEMS_PER_PAGE = 9;
const LOCATIONS = ['Masai Mara', 'Nairobi', 'Mombasa', 'Diani', 'Amboseli', 'Lake Nakuru', 'Mount Kenya'];
const DURATIONS = ['1 Day', '2-3 Days', '4-7 Days', '1 Week+'];
const GROUP_SIZES = Array.from({ length: 10 }, (_, i) => i + 1);

const BookingModal = ({ tour, isOpen, onClose, onBook }) => {
  const [bookingDate, setBookingDate] = useState(new Date());
  const [groupSize, setGroupSize] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const booking = {
        tourId: tour.id,
        tourName: tour.title,
        date: Timestamp.fromDate(bookingDate),
        groupSize,
        totalPrice: tour.price * groupSize,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'bookings'), booking);
      setBookingSuccess(true);
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-100 flex items-center justify-center">
      <motion.div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block p-4 bg-success text-white rounded-full mb-4"
            >
              <FaCheck className="text-3xl" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800">Booking Successful!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Book {tour.title}</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <DatePicker
                  selected={bookingDate}
                  onChange={date => setBookingDate(date)}
                  minDate={new Date()}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Group Size</label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  {GROUP_SIZES.map(size => (
                    <option key={size} value={size}>{size} {size === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-neutral/10 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Price per person:</span>
                  <span>${tour.price}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Group size:</span>
                  <span>{groupSize}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 text-lg">
                  <span>Total:</span>
                  <span>${tour.price * groupSize}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const ExploreTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    sortBy: 'price_asc'
  });
  const [wishlist, setWishlist] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      handleFilterChange('search', searchTerm);
    }, 500),
    []
  );

  const fetchTours = async (isInitial = false) => {
    try {
      setLoading(true);
      let q = query(collection(db, 'tours'));

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          q = query(q, orderBy('price', 'asc'));
          break;
        case 'price_desc':
          q = query(q, orderBy('price', 'desc'));
          break;
        case 'rating':
          q = query(q, orderBy('rating', 'desc'));
          break;
        default:
          q = query(q, orderBy('title'));
      }

      q = query(q, limit(ITEMS_PER_PAGE));

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      // Apply filters
      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }
      if (filters.minPrice) {
        q = query(q, where('price', '>=', Number(filters.minPrice)));
      }
      if (filters.maxPrice) {
        q = query(q, where('price', '<=', Number(filters.maxPrice)));
      }
      if (filters.duration) {
        q = query(q, where('duration', '==', filters.duration));
      }

      const snapshot = await getDocs(q);
      const newTours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(tour => 
        filters.search ? 
        tour.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.description.toLowerCase().includes(filters.search.toLowerCase())
        : true
      );

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);

      if (isInitial) {
        setTours(newTours);
      } else {
        setTours(prev => [...prev, ...newTours]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours(true);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setLastDoc(null);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTours();
    }
  };

  const handleBookNow = (tour) => {
    setSelectedTour(tour);
    setIsBookingModalOpen(true);
  };

  // Fetch wishlist status for all tours
  const fetchWishlistStatus = async () => {
    try {
      setWishlistLoading(true);
      // TODO: Replace with actual user ID from auth
      const userId = 'current-user-id';
      const q = query(
        collection(db, 'wishlist'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const wishlistStatus = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        wishlistStatus[data.tourId] = {
          id: doc.id,
          ...data
        };
      });
      
      setWishlist(wishlistStatus);
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistStatus();
  }, []);

  const handleWishlist = async (tour) => {
    try {
      // TODO: Replace with actual user ID from auth
      const userId = 'current-user-id';
      
      if (wishlist[tour.id]) {
        // Remove from wishlist
        await deleteDoc(doc(db, 'wishlist', wishlist[tour.id].id));
        setWishlist(prev => {
          const newWishlist = { ...prev };
          delete newWishlist[tour.id];
          return newWishlist;
        });
      } else {
        // Add to wishlist
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId,
          tourId: tour.id,
          addedAt: Timestamp.now()
        });
        
        setWishlist(prev => ({
          ...prev,
          [tour.id]: {
            id: docRef.id,
            userId,
            tourId: tour.id
          }
        }));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral/10 py-12 px-4 sm:px-6 lg:px-8">
      {/* Search and Filters */}
      <motion.div
        className="max-w-7xl mx-auto mb-12"
        {...animations.fadeIn}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                {LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="relative">
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              >
                <option value="">Any Duration</option>
                {DURATIONS.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <FaStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min $"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max $"
                  className="w-full pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tours Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <motion.div
                key={tour.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="relative group">
                  <img
                    src={tour.imageUrl}
                    alt={tour.title}
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
                    ${tour.price}
                  </div>
                  <motion.button
                    onClick={() => handleWishlist(tour)}
                    className={`absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg transition-colors duration-200 ${
                      wishlist[tour.id] ? 'text-danger hover:bg-danger hover:text-white' : 'text-gray-400 hover:text-danger'
                    }`}
                    whileTap={{ scale: 0.8 }}
                    animate={wishlist[tour.id] ? { scale: [1, 1.2, 1] } : {}}
                  >
                    <FaHeart className={`text-lg ${wishlistLoading ? 'opacity-50' : ''}`} />
                  </motion.button>
                  {tour.rating && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center">
                      <FaStar className="text-warning mr-1" />
                      {tour.rating}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{tour.title}</h3>
                  <div className="flex items-center mb-3">
                    <FaMapMarkerAlt className="text-primary mr-2" />
                    <span className="text-gray-600">{tour.location}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <FaClock className="text-primary mr-2" />
                    <span className="text-gray-600">{tour.duration}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                  <button 
                    onClick={() => handleBookNow(tour)}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-primary hover:bg-neutral/10 text-primary font-semibold py-2 px-6 border border-primary rounded-lg transition-all duration-200 hover:scale-105"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingModal
            tour={selectedTour}
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreTours;