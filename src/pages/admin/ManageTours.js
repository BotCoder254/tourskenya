import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCalendar, FaUsers, FaDollarSign, FaMapMarkerAlt, FaStar, FaSearch, FaList, FaThLarge } from 'react-icons/fa';
import { animations } from '../../constants/theme';

const TourCard = ({ tour, onEdit, onDelete }) => (
  <motion.div
    className="bg-white rounded-xl overflow-hidden shadow-lg"
    whileHover={{ y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative">
      <img
        src={tour.imageUrl || tour.images?.[0] || 'https://via.placeholder.com/400x200'}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full">
        From ${tour.price?.toFixed(2) || '0.00'}
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
      
      <div className="flex items-center mb-3">
        <FaMapMarkerAlt className="text-primary mr-2" />
        <span className="text-gray-600">{tour.location}</span>
      </div>

      <div className="flex items-center mb-3">
        <FaCalendar className="text-primary mr-2" />
        <span className="text-gray-600">{tour.duration}</span>
      </div>

      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < (tour.rating || 5) ? 'text-yellow-400' : 'text-gray-300'} />
          ))}
        </div>
        <span className="ml-2 text-gray-600">({tour.reviews || 0} reviews)</span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

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
    images: [],
    imageUrls: tour?.images || []
  });
  const [imagePreview, setImagePreview] = useState(tour?.imageUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData(prev => ({ ...prev, images: Array.from(files) }));
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const imageUrls = [...formData.imageUrls];
      
      // Upload new images
      for (const image of formData.images) {
        const imageRef = ref(storage, `tours/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      const tourData = {
        ...formData,
        price: parseFloat(formData.price),
        maxGroupSize: parseInt(formData.maxGroupSize),
        images: imageUrls,
        imageUrl: imageUrls[0] || '',
        updatedAt: new Date().toISOString()
      };

      // Remove the images field as it contains File objects
      delete tourData.images;
      
      await onSubmit(tourData);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
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
        <label className="block text-gray-700 mb-2">Tour Images</label>
        <div className="flex flex-col space-y-4">
          {imagePreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200">
              <FaImage />
              <span>Choose Images</span>
              <input
                type="file"
                name="images"
                onChange={handleInputChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </label>
            {formData.images.length > 0 && (
              <span className="text-green-500">{formData.images.length} images selected</span>
            )}
          </div>
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
          disabled={uploading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors duration-200 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : (tour ? 'Update Tour' : 'Create Tour')}
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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

  const handleSubmit = async (tourData) => {
    try {
      if (editingTour) {
        await updateDoc(doc(db, 'tours', editingTour.id), tourData);
      } else {
        await addDoc(collection(db, 'tours'), {
          ...tourData,
          createdAt: new Date().toISOString()
        });
      }

      setIsModalOpen(false);
      setEditingTour(null);
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);
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

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && tour.status === 'active') || (filterStatus === 'inactive' && tour.status === 'inactive');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Tours</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Tour</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search tours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <FaList /> : <FaThLarge />}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredTours.map(tour => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  viewMode={viewMode}
                  onEdit={() => {
                    setEditingTour(tour);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ManageTours; 