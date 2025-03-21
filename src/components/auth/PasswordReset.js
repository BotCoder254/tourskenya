import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { animations } from '../../constants/theme';
import { Link } from 'react-router-dom';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setError('');
    } catch (error) {
      setError(error.message);
      setSuccess(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Reset Password</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Password reset email sent! Please check your inbox.
        </div>
      )}

      <form onSubmit={handlePasswordReset} className="space-y-4">
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

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-secondary transition duration-200 bg-blue-500"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-8 space-y-2">
        <p className="text-center text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:text-secondary">
            Sign In
          </Link>
        </p>
        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-secondary">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default PasswordReset; 