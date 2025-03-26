import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import {
  FaCalendar,
  FaLock,
  FaLockOpen,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';

const TourAvailability = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursRef = collection(db, 'tours');
        const snapshot = await getDocs(toursRef);
        const fetchedTours = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTours(fetchedTours);
        if (fetchedTours.length > 0) {
          setSelectedTour(fetchedTours[0]);
        }
      } catch (error) {
        console.error('Error fetching tours:', error);
        toast.error('Failed to load tours');
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedTour) return;
      
      setLoading(true);
      try {
        const availabilityRef = collection(db, 'availability');
        const q = query(
          availabilityRef,
          where('tourId', '==', selectedTour.id),
          where('date', '>=', startOfMonth(currentDate)),
          where('date', '<=', endOfMonth(currentDate))
        );
        
        const snapshot = await getDocs(q);
        const availabilityData = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          availabilityData[format(data.date.toDate(), 'yyyy-MM-dd')] = {
            id: doc.id,
            ...data
          };
        });
        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error fetching availability:', error);
        toast.error('Failed to load availability data');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedTour, currentDate]);

  const handleSlotUpdate = async (date, slots) => {
    if (!selectedTour) return;

    setSaving(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const availabilityRef = doc(db, 'availability', availability[dateStr]?.id || 'new');
      
      await updateDoc(availabilityRef, {
        tourId: selectedTour.id,
        date: date,
        availableSlots: slots,
        updatedAt: new Date()
      });

      setAvailability(prev => ({
        ...prev,
        [dateStr]: {
          ...prev[dateStr],
          availableSlots: slots
        }
      }));

      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = availability[dateStr]?.availableSlots || 0;
    
    if (slots === 0) return 'unavailable';
    if (slots <= 5) return 'limited';
    return 'available';
  };

  const renderCalendar = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const status = getSlotStatus(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <motion.div
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              className={`
                p-4 rounded-lg cursor-pointer
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday(date) ? 'ring-2 ring-primary' : ''}
              `}
            >
              <div className="text-sm mb-2">
                {format(date, 'd')}
              </div>
              <div className={`
                text-xs font-medium px-2 py-1 rounded
                ${status === 'available' ? 'bg-green-100 text-green-800' : ''}
                ${status === 'limited' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${status === 'unavailable' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {availability[dateStr]?.availableSlots || 0} slots
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tour Availability</h1>
          <p className="mt-2 text-gray-600">Manage tour slots and availability</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <select
              value={selectedTour?.id}
              onChange={(e) => setSelectedTour(tours.find(t => t.id === e.target.value))}
              className="form-select w-64"
            >
              {tours.map(tour => (
                <option key={tour.id} value={tour.id}>
                  {tour.title}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaCalendar className="text-gray-600" />
              </button>
              <span className="text-lg font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaCalendar className="text-gray-600" />
              </button>
            </div>
          </div>

          {renderCalendar()}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Availability Legend</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-yellow-100 mr-2"></div>
              <span className="text-sm text-gray-600">Limited</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-red-100 mr-2"></div>
              <span className="text-sm text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourAvailability; 