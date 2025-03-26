import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaCog,
  FaUserShield,
  FaBell,
  FaGlobe,
  FaMoneyBillWave,
  FaLock
} from 'react-icons/fa';

const SettingsSection = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-sm p-6 mb-6"
  >
    <div className="flex items-center mb-4">
      <Icon className="text-primary w-5 h-5 mr-2" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      newBookings: true,
      bookingCancellations: true,
      lowAvailability: true,
      reviews: true
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 30
    },
    general: {
      language: 'en',
      timezone: 'UTC',
      currency: 'USD'
    },
    booking: {
      maxGroupSize: 15,
      minAdvanceBooking: 2,
      cancellationPeriod: 24
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'adminSettings', 'global');
        const snapshot = await getDoc(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(snapshot.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsRef = doc(db, 'adminSettings', 'global');
      await updateDoc(settingsRef, settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        <SettingsSection title="Notifications" icon={FaBell}>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleChange('notifications', key, e.target.checked)}
                  className="form-checkbox h-5 w-5 text-primary"
                />
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="Security" icon={FaLock}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Require Two-Factor Authentication</label>
              <input
                type="checkbox"
                checked={settings.security.requireTwoFactor}
                onChange={(e) => handleChange('security', 'requireTwoFactor', e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="form-input w-24"
                min="5"
                max="120"
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="General" icon={FaGlobe}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Language</label>
              <select
                value={settings.general.language}
                onChange={(e) => handleChange('general', 'language', e.target.value)}
                className="form-select w-40"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Timezone</label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                className="form-select w-40"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Currency</label>
              <select
                value={settings.general.currency}
                onChange={(e) => handleChange('general', 'currency', e.target.value)}
                className="form-select w-40"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Booking Settings" icon={FaMoneyBillWave}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Maximum Group Size</label>
              <input
                type="number"
                value={settings.booking.maxGroupSize}
                onChange={(e) => handleChange('booking', 'maxGroupSize', parseInt(e.target.value))}
                className="form-input w-24"
                min="1"
                max="50"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Minimum Advance Booking (days)</label>
              <input
                type="number"
                value={settings.booking.minAdvanceBooking}
                onChange={(e) => handleChange('booking', 'minAdvanceBooking', parseInt(e.target.value))}
                className="form-input w-24"
                min="0"
                max="30"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Cancellation Period (hours)</label>
              <input
                type="number"
                value={settings.booking.cancellationPeriod}
                onChange={(e) => handleChange('booking', 'cancellationPeriod', parseInt(e.target.value))}
                className="form-input w-24"
                min="1"
                max="72"
              />
            </div>
          </div>
        </SettingsSection>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-2 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FaCog className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 