import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animations } from '../../constants/theme';

const HERO_IMAGE = "https://images.unsplash.com/photo-1523805009345-7448845a9e53?q=80&w=2072&auto=format&fit=crop";

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="relative h-screen overflow-hidden">
      <motion.div 
        style={{ y }}
        className="absolute inset-0"
      >
        <img
          src={HERO_IMAGE}
          alt="Kenya Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative h-full flex items-center justify-center text-center">
        <motion.div
          className="max-w-4xl px-6"
          initial={animations.fadeIn.initial}
          animate={animations.fadeIn.animate}
          transition={{ delay: 0.2, ...animations.fadeIn.transition }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Explore Kenya's Best Tours
          </motion.h1>
          
          <motion.p
            className="text-xl text-white/90 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Experience the magic of Kenya's wildlife, culture, and landscapes
          </motion.p>

          <Link to="/tours">
            <motion.button
              className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Tours
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="animate-bounce">
          <svg 
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero; 