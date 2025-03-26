import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import TourCard from '../components/tours/TourCard';
import FiltersPanel from '../components/search/FiltersPanel';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchResults = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [filters, setFilters] = useState({
    destination: '',
    price: { min: 0, max: 5000 },
    duration: '',
    activities: []
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialDestination = searchParams.get('destination') || '';
    
    setFilters(prev => ({
      ...prev,
      destination: initialDestination
    }));
  }, [location]);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const toursRef = collection(db, 'tours');
        let q = query(toursRef);

        // Apply filters
        if (filters.destination) {
          q = query(q, where('destination', '==', filters.destination));
        }

        const snapshot = await getDocs(q);
        let fetchedTours = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Apply client-side filters
        fetchedTours = fetchedTours.filter(tour => {
          const priceMatch = tour.price >= filters.price.min && tour.price <= filters.price.max;
          
          const durationMatch = !filters.duration || tour.duration.includes(filters.duration);
          
          const activitiesMatch = filters.activities.length === 0 ||
            filters.activities.every(activity => tour.activities?.includes(activity));

          return priceMatch && durationMatch && activitiesMatch;
        });

        setTours(fetchedTours);
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [filters]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const wishlistItems = snapshot.docs.map(doc => doc.data().tourId);
        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleWishlistToggle = async (tourId) => {
    try {
      const wishlistRef = collection(db, 'wishlist');
      const isWishlisted = wishlist.includes(tourId);

      if (isWishlisted) {
        const q = query(
          wishlistRef,
          where('userId', '==', user.uid),
          where('tourId', '==', tourId)
        );
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
        setWishlist(prev => prev.filter(id => id !== tourId));
      } else {
        await addDoc(wishlistRef, {
          userId: user.uid,
          tourId,
          createdAt: new Date()
        });
        setWishlist(prev => [...prev, tourId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
            <p className="mt-2 text-gray-600">
              Found {tours.length} tours matching your criteria
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary flex items-center"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={false}
            animate={{
              width: showFilters ? 'auto' : 0,
              opacity: showFilters ? 1 : 0
            }}
            className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
            />
          </motion.div>

          <div className="flex-1">
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map(tour => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlist.includes(tour.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No tours found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your filters or search for a different destination
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 