import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, startAfter, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { animations } from '../constants/theme';

const ITEMS_PER_PAGE = 9;

const ExploreTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    duration: ''
  });

  const fetchTours = async (isInitial = false) => {
    try {
      setLoading(true);
      let q = query(collection(db, 'tours'), orderBy('title'), limit(ITEMS_PER_PAGE));

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
      }));

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
    setLastDoc(null); // Reset pagination when filters change
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTours();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Search and Filters */}
      <motion.div
        className="max-w-7xl mx-auto mb-12"
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                <option value="Masai Mara">Masai Mara</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Diani">Diani</option>
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
                <option value="1 Day">1 Day</option>
                <option value="2-3 Days">2-3 Days</option>
                <option value="4-7 Days">4-7 Days</option>
                <option value="1 Week+">1 Week+</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder="Min Price"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                placeholder="Max Price"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tours Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <motion.div
              key={tour.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
                  ${tour.price}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
                <div className="flex items-center mb-3">
                  <FaMapMarkerAlt className="text-primary mr-2" />
                  <span className="text-gray-600">{tour.location}</span>
                </div>
                <div className="flex items-center mb-4">
                  <FaClock className="text-primary mr-2" />
                  <span className="text-gray-600">{tour.duration}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                <button className="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg transition-colors duration-200">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-white hover:bg-gray-50 text-primary font-semibold py-2 px-6 border border-primary rounded-lg transition-colors duration-200"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreTours;