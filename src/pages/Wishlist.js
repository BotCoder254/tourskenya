import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaMapMarkerAlt, FaClock, FaHeart, FaTrash } from 'react-icons/fa';
import { animations } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'wishlist'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const items = [];
      
      for (const docRef of snapshot.docs) {
        const wishlistData = docRef.data();
        // Fetch the tour details
        const tourDocRef = doc(db, 'tours', wishlistData.tourId);
        const tourDoc = await getDoc(tourDocRef);
        
        if (tourDoc.exists()) {
          items.push({
            id: docRef.id,
            ...wishlistData,
            tour: { id: tourDoc.id, ...tourDoc.data() }
          });
        }
      }
      
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await deleteDoc(doc(db, 'wishlist', wishlistId));
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My Wishlist
        </motion.h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaHeart className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Your wishlist is empty</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map(({ id, tour }) => (
                <motion.div
                  key={id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ y: -5 }}
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
                    <button
                      onClick={() => handleRemoveFromWishlist(id)}
                      className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-danger hover:text-white transition-colors duration-200"
                    >
                      <FaTrash className="text-sm" />
                    </button>
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
                    <button className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02]">
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 