import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { FaCalendar, FaEdit, FaSave, FaTimes, FaLock, FaUnlock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const TourSlots = ({ tourId }) => {
  const [slots, setSlots] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlots, setEditingSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [lockedDates, setLockedDates] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'tours', tourId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSlots(data.slots || {});
          setLockedDates(data.lockedDates || {});
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching tour slots:', error);
        toast.error('Failed to load tour slots');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tourId]);

  const getDaysInMonth = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  };

  const handleSlotChange = (date, value) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setEditingSlots(prev => ({
      ...prev,
      [dateStr]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleSave = async () => {
    try {
      const tourRef = doc(db, 'tours', tourId);
      await updateDoc(tourRef, {
        slots: {
          ...slots,
          ...editingSlots
        }
      });
      setIsEditing(false);
      setEditingSlots({});
      toast.success('Tour slots updated successfully');
    } catch (error) {
      console.error('Error updating tour slots:', error);
      toast.error('Failed to update tour slots');
    }
  };

  const toggleDateLock = async (date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const tourRef = doc(db, 'tours', tourId);
      await updateDoc(tourRef, {
        lockedDates: {
          ...lockedDates,
          [dateStr]: !lockedDates[dateStr]
        }
      });
      toast.success(`Date ${lockedDates[dateStr] ? 'unlocked' : 'locked'} successfully`);
    } catch (error) {
      console.error('Error toggling date lock:', error);
      toast.error('Failed to toggle date lock');
    }
  };

  const getSlotStatus = (slots, isLocked) => {
    if (isLocked) return 'bg-gray-100 text-gray-800';
    if (!slots || slots === 0) return 'bg-red-100 text-red-800';
    if (slots < 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedMonth(prev => addMonths(prev, -1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {format(selectedMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            →
          </button>
        </div>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FaSave className="mr-2" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingSlots({});
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FaEdit className="mr-2" />
              Edit Slots
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        {getDaysInMonth().map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const availableSlots = isEditing ? (editingSlots[dateStr] ?? slots[dateStr] ?? 0) : (slots[dateStr] ?? 0);
          const isLocked = lockedDates[dateStr];
          
          return (
            <motion.div
              key={dateStr}
              className={`p-2 rounded-lg border ${isEditing ? 'border-gray-300' : 'border-transparent'}`}
              whileHover={{ scale: isEditing ? 1.05 : 1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-600">
                  {format(date, 'd')}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => toggleDateLock(date)}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isLocked ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {isLocked ? <FaLock size={12} /> : <FaUnlock size={12} />}
                  </button>
                )}
              </div>
              {isEditing && !isLocked ? (
                <input
                  type="number"
                  min="0"
                  value={availableSlots}
                  onChange={(e) => handleSlotChange(date, e.target.value)}
                  className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              ) : (
                <div className={`text-center py-1 rounded-full text-xs font-medium ${getSlotStatus(availableSlots, isLocked)}`}>
                  {isLocked ? 'Locked' : `${availableSlots} slots`}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-100 mr-2"></div>
          <span>Available (5+ slots)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-100 mr-2"></div>
          <span>Limited (1-4 slots)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-100 mr-2"></div>
          <span>Fully Booked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-100 mr-2"></div>
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
};

export default TourSlots; 