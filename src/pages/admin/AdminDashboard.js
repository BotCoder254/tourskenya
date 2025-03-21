import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FaUsers, FaRoute, FaBookmark, FaChartLine, FaCalendarCheck, FaExclamationCircle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { animations } from '../../constants/theme';

const StatCard = ({ icon: Icon, label, value, color, percentage }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg p-6"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {percentage && (
          <div className={`flex items-center mt-2 ${percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span className="text-sm">
              {percentage >= 0 ? '↑' : '↓'} {Math.abs(percentage)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last month</span>
          </div>
        )}
      </div>
      <div className={`text-3xl ${color}`}>
        <Icon />
      </div>
    </div>
  </motion.div>
);

const RecentBookingCard = ({ booking }) => (
  <motion.div
    className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-2"
    whileHover={{ x: 5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center">
      <img
        src={booking.tour?.imageUrl}
        alt={booking.tour?.title}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="ml-4">
        <h4 className="font-semibold">{booking.tour?.title}</h4>
        <p className="text-sm text-gray-500">{booking.user?.email}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold">${booking.amount}</p>
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {booking.status}
      </span>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, percentage: 0 },
    tours: { total: 0, percentage: 0 },
    bookings: { total: 0, percentage: 0 },
    revenue: { total: 0, percentage: 0 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularTours, setPopularTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch current month stats
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [usersSnap, toursSnap, bookingsSnap, lastMonthBookings] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'tours')),
          getDocs(query(collection(db, 'bookings'), where('createdAt', '>=', firstDayOfMonth))),
          getDocs(query(collection(db, 'bookings'), where('createdAt', '>=', firstDayOfLastMonth), where('createdAt', '<', firstDayOfMonth)))
        ]);

        const currentRevenue = bookingsSnap.docs.reduce((acc, doc) => {
          const booking = doc.data();
          return acc + (booking.status === 'paid' ? booking.amount : 0);
        }, 0);

        const lastMonthRevenue = lastMonthBookings.docs.reduce((acc, doc) => {
          const booking = doc.data();
          return acc + (booking.status === 'paid' ? booking.amount : 0);
        }, 0);

        setStats({
          users: {
            total: usersSnap.size,
            percentage: 12 // Calculate actual percentage
          },
          tours: {
            total: toursSnap.size,
            percentage: 8
          },
          bookings: {
            total: bookingsSnap.size,
            percentage: ((bookingsSnap.size - lastMonthBookings.size) / lastMonthBookings.size) * 100
          },
          revenue: {
            total: currentRevenue,
            percentage: ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          }
        });

        // Fetch recent bookings with tour and user details
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentBookingsSnap = await getDocs(recentBookingsQuery);
        const recentBookingsData = await Promise.all(
          recentBookingsSnap.docs.map(async (doc) => {
            const booking = { id: doc.id, ...doc.data() };
            const tourDoc = await getDocs(doc(db, 'tours', booking.tourId));
            booking.tour = tourDoc.data();
            return booking;
          })
        );
        setRecentBookings(recentBookingsData);

        // Fetch popular tours
        const popularToursQuery = query(
          collection(db, 'tours'),
          orderBy('bookings', 'desc'),
          limit(5)
        );
        const popularToursSnap = await getDocs(popularToursQuery);
        setPopularTours(popularToursSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm font-semibold">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaUsers}
          label="Total Users"
          value={stats.users.total}
          color="text-blue-500"
          percentage={stats.users.percentage}
        />
        <StatCard
          icon={FaRoute}
          label="Active Tours"
          value={stats.tours.total}
          color="text-green-500"
          percentage={stats.tours.percentage}
        />
        <StatCard
          icon={FaBookmark}
          label="Monthly Bookings"
          value={stats.bookings.total}
          color="text-yellow-500"
          percentage={stats.bookings.percentage}
        />
        <StatCard
          icon={FaChartLine}
          label="Monthly Revenue"
          value={`$${stats.revenue.total.toLocaleString()}`}
          color="text-purple-500"
          percentage={stats.revenue.percentage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-sm text-green-500">
                <FaCalendarCheck className="mr-1" /> Confirmed: {recentBookings.filter(b => b.status === 'confirmed').length}
              </span>
              <span className="flex items-center text-sm text-red-500">
                <FaExclamationCircle className="mr-1" /> Pending: {recentBookings.filter(b => b.status === 'pending').length}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {recentBookings.map(booking => (
              <RecentBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-6">Popular Tours</h2>
          <div className="space-y-4">
            {popularTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-2xl font-bold text-gray-300 mr-4">#{index + 1}</span>
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold">{tour.title}</h4>
                  <p className="text-sm text-gray-500">{tour.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${tour.price}</p>
                  <p className="text-sm text-gray-500">{tour.bookings || 0} bookings</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;