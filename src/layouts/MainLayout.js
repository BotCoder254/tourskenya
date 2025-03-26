import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AdminNav from '../components/admin/AdminNav';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdminRoute ? (
        <div className="flex">
          <AdminNav />
          <main className="flex-1 ml-[240px] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className=" rounded-lg shadow-sm">
                {children}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="flex">
          <Navigation />
          <main className="flex-1 ml-[240px] p-6">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 