import { motion } from 'framer-motion';
import { animations } from '../constants/theme';

const AuthLayout = ({ children, imageSrc }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={animations.fadeIn.initial}
        animate={animations.fadeIn.animate}
        transition={animations.fadeIn.transition}
      >
        <img 
          src={imageSrc} 
          alt="Kenya Tourism" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-12">
          <h1 className="text-white text-4xl font-bold">Discover Kenya's Beauty</h1>
        </div>
      </motion.div>

      {/* Right side - Auth Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white"
        initial={animations.slideIn.initial}
        animate={animations.slideIn.animate}
        transition={animations.slideIn.transition}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout; 