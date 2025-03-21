import { useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaEnvelope, FaLock } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../config/firebase';
import { animations } from '../../constants/theme';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the page they tried to visit or home
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      // Navigate to the page they tried to visit or home
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome Back</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <Link 
            to="/reset-password"
            className="block mt-2 text-sm text-primary hover:text-secondary"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition duration-200 bg-blue-500"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin(googleProvider)}
            className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FcGoogle className="text-xl mr-2" />
            Google
          </button>
          <button
            onClick={() => handleSocialLogin(facebookProvider)}
            className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FaFacebook className="text-xl mr-2 text-blue-600" />
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:text-secondary">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
};

export default Login; 