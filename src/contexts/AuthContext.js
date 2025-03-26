import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ROLES, ROLE_PERMISSIONS } from '../config/roles';

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
  const [userRole, setUserRole] = useState(ROLES.GUEST);

  useEffect(() => {
    let unsubscribe;
    try {
      // Ensure auth is initialized
      const auth = getAuth();
      
      unsubscribe = onAuthStateChanged(auth, 
        async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // Get user role from Firestore
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              const role = userDoc.exists() ? userDoc.data().role || ROLES.USER : ROLES.USER;
              setUserRole(role);
              setUser({ ...firebaseUser, role });
            } else {
              setUser(null);
              setUserRole(ROLES.GUEST);
            }
          } catch (err) {
            console.error('Error processing auth state change:', err);
            setError(err);
            setUser(null);
            setUserRole(ROLES.GUEST);
          } finally {
            setLoading(false);
            setAuthInitialized(true);
          }
        },
        (err) => {
          console.error('Auth state change error:', err);
          setError(err);
          setLoading(false);
          setAuthInitialized(true);
        }
      );
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError(err);
      setLoading(false);
      setAuthInitialized(true);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  };

  const isAdmin = () => userRole === ROLES.ADMIN;

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
    authInitialized,
    userRole,
    hasPermission,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext; 