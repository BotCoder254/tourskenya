import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaStar, FaRegClock, FaMapMarkerAlt } from 'react-icons/fa';

// Placeholder tour data with online images
const PLACEHOLDER_TOURS = [
  {
    id: '1',
    title: 'Masai Mara Safari',
    location: 'Masai Mara',
    duration: '3 Days',
    price: 299,
    rating: 5,
    reviews: 128,
    description: 'Experience the incredible wildlife of the Masai Mara National Reserve.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Mount Kenya Trek',
    location: 'Mount Kenya',
    duration: '5 Days',
    price: 399,
    rating: 4,
    reviews: 89,
    description: 'Climb to the peaks of Mount Kenya with experienced guides.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Diani Beach Escape',
    location: 'Diani',
    duration: '4 Days',
    price: 349,
    rating: 5,
    reviews: 156,
    description: 'Relax on the pristine beaches of Diani with luxury accommodations.',
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?q=80&w=2073&auto=format&fit=crop'
  }
];

const TourCard = ({ tour }) => {
  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-lg"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
          From ${tour.price}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
        
        <div className="flex items-center mb-3">
          <FaMapMarkerAlt className="text-primary mr-2" />
          <span className="text-gray-600">{tour.location}</span>
        </div>

        <div className="flex items-center mb-3">
          <FaRegClock className="text-primary mr-2" />
          <span className="text-gray-600">{tour.duration}</span>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < tour.rating ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
          </div>
          <span className="ml-2 text-gray-600">({tour.reviews} reviews)</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

        <button className="w-full bg-primary hover:bg-secondary text-white py-2 rounded-lg transition-colors duration-200">
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const PopularTours = () => {
  const [tours, setTours] = useState(PLACEHOLDER_TOURS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const q = query(collection(db, 'tours'), limit(6));
        const querySnapshot = await getDocs(q);
        const toursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (toursData.length > 0) {
          setTours(toursData);
        }
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Popular Tours
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular tours across Kenya, from wildlife safaris to cultural experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full transition-colors duration-200">
            View All Tours
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularTours; 