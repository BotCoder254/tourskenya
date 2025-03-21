import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setLoading(false);
        setAuthInitialized(true);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error);
        setLoading(false);
        setAuthInitialized(true);
      }
    );

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Authentication Error</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const value = {
    user,
    loading,
    error,
    authInitialized
  };

  // Only render children when auth is initialized
  return (
    <AuthContext.Provider value={value}>
      {authInitialized ? children : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext; 