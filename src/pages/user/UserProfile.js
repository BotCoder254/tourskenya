import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfile(data);
          setFormData({
            fullName: data.fullName || '',
            phone: data.phone || '',
            address: data.address || '',
            bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), formData);
      setProfile(prev => ({
        ...prev,
        ...formData
      }));
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
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
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="relative h-48 bg-primary">
              <div className="absolute -bottom-12 left-8">
                <div className="relative">
                  <img
                    src={profile?.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white"
                  />
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50">
                    <FaCamera className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-16 pb-8 px-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.fullName || 'Complete Your Profile'}
                </h1>
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-secondary"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <p className="text-gray-500">{profile?.bio || 'No bio added yet'}</p>
            </div>
          </div>

          {/* Profile Form */}
          <motion.div
            initial={false}
            animate={editing ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <FaEnvelope className="w-5 h-5 mr-3" />
                <span>{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center text-gray-600">
                  <FaPhone className="w-5 h-5 mr-3" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="w-5 h-5 mr-3" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 