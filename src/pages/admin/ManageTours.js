import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCalendar, FaUsers, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa';
import { animations } from '../../constants/theme';

const TourCard = ({ tour, onEdit, onDelete }) => (
  <motion.div
    className="bg-white rounded-lg shadow-lg overflow-hidden"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <img
        src={tour.imageUrl || 'https://via.placeholder.com/400x200'}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
        ${tour.price?.toFixed(2) || '0.00'}
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="mr-2" />
          <span>{tour.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaCalendar className="mr-2" />
          <span>{tour.duration}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaUsers className="mr-2" />
          <span>Max: {tour.maxGroupSize}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaDollarSign className="mr-2" />
          <span>{tour.price?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(tour)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(tour.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </motion.div>
);

const TourForm = ({ tour, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: tour?.title || '',
    description: tour?.description || '',
    location: tour?.location || '',
    price: tour?.price || '',
    duration: tour?.duration || '',
    maxGroupSize: tour?.maxGroupSize || '',
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows="4"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Max Group Size</label>
          <input
            type="number"
            name="maxGroupSize"
            value={formData.maxGroupSize}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Tour Image</label>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200">
            <FaImage />
            <span>Choose Image</span>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              className="hidden"
              accept="image/*"
            />
          </label>
          {formData.image && (
            <span className="text-green-500">Image selected</span>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-200"
        >
          {tour ? 'Update Tour' : 'Create Tour'}
        </button>
      </div>
    </form>
  );
};

const ManageTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const toursSnap = await getDocs(collection(db, 'tours'));
      const toursData = toursSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTours(toursData);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      let imageUrl = '';
      if (formData.image) {
        const imageRef = ref(storage, `tours/${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const tourData = {
        ...formData,
        imageUrl: imageUrl || (editingTour?.imageUrl || ''),
        updatedAt: new Date().toISOString(),
      };

      if (editingTour) {
        await updateDoc(doc(db, 'tours', editingTour.id), tourData);
      } else {
        tourData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'tours'), tourData);
      }

      setIsModalOpen(false);
      setEditingTour(null);
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await deleteDoc(doc(db, 'tours', tourId));
        fetchTours();
      } catch (error) {
        console.error('Error deleting tour:', error);
      }
    }
  };

  return (
    <motion.div
      className="p-6"
      initial={animations.fadeIn.initial}
      animate={animations.fadeIn.animate}
      transition={animations.fadeIn.transition}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Tours</h1>
        <button
          onClick={() => {
            setEditingTour(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors duration-200 bg-blue-500"
        >
          <FaPlus />
          <span>Create New Tour</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onEdit={() => {
                setEditingTour(tour);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Tour Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-lg w-full max-w-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingTour ? 'Edit Tour' : 'Create New Tour'}
              </h2>
              <TourForm
                tour={editingTour}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingTour(null);
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageTours; 