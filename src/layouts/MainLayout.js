import Navigation from '../components/Navigation';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 ml-[240px] transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 