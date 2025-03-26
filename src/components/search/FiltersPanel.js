import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const FilterSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-200 py-4">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left"
    >
      <span className="font-medium text-gray-900">{title}</span>
      {isOpen ? (
        <FaChevronUp className="text-gray-500" />
      ) : (
        <FaChevronDown className="text-gray-500" />
      )}
    </button>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-4"
      >
        {children}
      </motion.div>
    )}
  </div>
);

const FiltersPanel = ({ filters, onChange }) => {
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    price: true,
    duration: false,
    activities: false,
    rating: false
  });

  useEffect(() => {
    const loadSavedFilters = async () => {
      if (!user) return;

      try {
        const userFiltersDoc = await getDoc(doc(db, 'userPreferences', user.uid));
        if (userFiltersDoc.exists()) {
          const savedFilters = userFiltersDoc.data().filters;
          onChange(savedFilters);
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    };

    loadSavedFilters();
  }, [user]);

  const handleFilterChange = async (newFilters) => {
    onChange(newFilters);

    if (user) {
      try {
        await setDoc(doc(db, 'userPreferences', user.uid), {
          filters: newFilters
        }, { merge: true });
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      destination: '',
      price: { min: 0, max: 5000 },
      duration: '',
      activities: []
    };
    onChange(defaultFilters);
  };

  const activities = [
    'Wildlife Safari',
    'Beach Activities',
    'Mountain Climbing',
    'Cultural Tours',
    'City Tours',
    'Photography',
    'Adventure',
    'Camping'
  ];

  const durations = [
    { label: '1-3 Days', value: 'short' },
    { label: '4-7 Days', value: 'medium' },
    { label: '8+ Days', value: 'long' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-primary" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <span>Reset All</span>
        </button>
      </div>

      <FilterSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Price ($)</label>
            <input
              type="number"
              value={filters.price.min}
              onChange={(e) => handleFilterChange({
                ...filters,
                price: { ...filters.price, min: Number(e.target.value) }
              })}
              className="form-input w-full"
              min="0"
              max={filters.price.max}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Price ($)</label>
            <input
              type="number"
              value={filters.price.max}
              onChange={(e) => handleFilterChange({
                ...filters,
                price: { ...filters.price, max: Number(e.target.value) }
              })}
              className="form-input w-full"
              min={filters.price.min}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Duration"
        isOpen={openSections.duration}
        onToggle={() => toggleSection('duration')}
      >
        <div className="space-y-2">
          {durations.map(({ label, value }) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                name="duration"
                checked={filters.duration === value}
                onChange={() => handleFilterChange({
                  ...filters,
                  duration: value
                })}
                className="form-radio text-primary"
              />
              <span className="ml-2 text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Activities"
        isOpen={openSections.activities}
        onToggle={() => toggleSection('activities')}
      >
        <div className="space-y-2">
          {activities.map(activity => (
            <label key={activity} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.activities.includes(activity)}
                onChange={(e) => {
                  const newActivities = e.target.checked
                    ? [...filters.activities, activity]
                    : filters.activities.filter(a => a !== activity);
                  handleFilterChange({
                    ...filters,
                    activities: newActivities
                  });
                }}
                className="form-checkbox text-primary"
              />
              <span className="ml-2 text-gray-600">{activity}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default FiltersPanel; 