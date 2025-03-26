import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const WishlistCard = ({ tour, onRemove }) => (
  <motion.div
    className="bg-white rounded-lg shadow-md overflow-hidden"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <img
        src={tour.imageUrl || 'https://via.placeholder.com/300x200'}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <button
        onClick={() => onRemove(tour.id)}
        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200"
      >
        <FaTrash className="text-red-500" />
      </button>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900">{tour.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{tour.location}</p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">${tour.price?.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{tour.duration} days</p>
        </div>
        <Link
          to={`/tours/${tour.id}`}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  </motion.div>
);

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const wishlistQuery = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid)
      );
      
      const wishlistSnap = await getDocs(wishlistQuery);
      const wishlistData = await Promise.all(
        wishlistSnap.docs.map(async (doc) => {
          const data = doc.data();
          const tourRef = doc.ref.parent.parent;
          if (tourRef) {
            const tourDoc = await getDoc(doc(db, 'tours', data.tourId));
            if (tourDoc.exists()) {
              return {
                id: tourDoc.id,
                wishlistId: doc.id,
                ...tourDoc.data()
              };
            }
          }
          return null;
        })
      );

      setWishlist(wishlistData.filter(Boolean));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (tourId) => {
    try {
      const wishlistItem = wishlist.find(item => item.id === tourId);
      if (wishlistItem?.wishlistId) {
        await deleteDoc(doc(db, 'wishlists', wishlistItem.wishlistId));
        setWishlist(prev => prev.filter(item => item.id !== tourId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="mt-2 text-sm text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? 'tour' : 'tours'} saved
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tours saved</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start exploring tours and add them to your wishlist
          </p>
          <div className="mt-6">
            <Link
              to="/tours"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Browse Tours
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((tour) => (
            <WishlistCard
              key={tour.id}
              tour={tour}
              onRemove={handleRemoveFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 