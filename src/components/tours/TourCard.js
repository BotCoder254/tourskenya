import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaUsers, FaClock, FaHeart } from 'react-icons/fa';

const TourCard = ({ tour, onWishlistToggle, isWishlisted = false }) => {
  const {
    id,
    title,
    imageUrl,
    price,
    duration,
    groupSize,
    rating,
    reviewCount,
    destination,
    description
  } = tour;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle(id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
        >
          <FaHeart className={isWishlisted ? 'text-red-500' : 'text-gray-400'} />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <div className="text-primary font-semibold">
            ${price}
            <span className="text-sm text-gray-500 font-normal">/person</span>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <div className="flex items-center mr-4">
            <FaClock className="mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center mr-4">
            <FaUsers className="mr-1" />
            <span>Max {groupSize}</span>
          </div>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{rating} ({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{destination}</span>
          <Link
            to={`/tours/${id}`}
            className="btn-secondary text-sm px-4 py-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard; 