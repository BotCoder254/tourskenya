import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaHistory, FaTimes } from 'react-icons/fa';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import useDebounce from '../../hooks/useDebounce';

const SearchBar = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Load recent searches from localStorage
    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    };

    loadRecentSearches();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const toursRef = collection(db, 'tours');
        const q = query(
          toursRef,
          where('searchKeywords', 'array-contains', debouncedSearchTerm.toLowerCase()),
          orderBy('popularity', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          destination: doc.data().destination
        }));

        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSearch = (term) => {
    // Save to recent searches
    const updatedSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search tours, destinations..."
          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (searchTerm || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {suggestions.length > 0 && (
                  <div className="p-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSearch(suggestion.title)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <FaSearch className="text-gray-400" />
                        <div>
                          <div className="font-medium">{suggestion.title}</div>
                          <div className="text-sm text-gray-500">{suggestion.destination}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="border-t">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500">Recent Searches</div>
                    <div className="p-2">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(term)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                        >
                          <FaHistory className="text-gray-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!suggestions.length && !recentSearches.length && searchTerm && (
                  <div className="p-4 text-center text-gray-500">
                    No results found
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar; 