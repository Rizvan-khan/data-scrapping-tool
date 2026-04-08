import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, List, Plus, X } from 'lucide-react'; // Icons ke liye lucide-react use kiya hai

function CreateData() {
    const navigate = useNavigate();
  const [searchTerms, setSearchTerms] = useState(['software company']);
  const [location, setLocation] = useState('Bareilly Uttar Pradesh');
  const [limit, setLimit] = useState(100);

  // Naya search input add karne ke liye
  const addSearchField = () => {
    setSearchTerms([...searchTerms, '']);
  };

  // Specific input remove karne ke liye
  const removeSearchField = (index) => {
    const newTerms = searchTerms.filter((_, i) => i !== index);
    setSearchTerms(newTerms);
  };

 const handleSearch = (e) => {
    e.preventDefault();
    
    // Yahan aap apna API call logic likh sakte hain
    console.log("Searching for:", { searchTerms, location, limit });

    // 3. Navigate to result page
    // Hum '/admin/search/result' par bhej rahe hain
    navigate('/admin/search/result/data'); 
  };

  return (
    <div className="max-w-4xl  p-6 bg-[#121212] text-gray-300 min-h-screen">
      {/* Header Info */}
      <p className="text-sm mb-6">
        Sections with <span className="font-bold">asterisk*</span> are just alternative ways to start the input 
        (🛰️ Geolocation parameters, 🗺️ Polygons, 🔗 URLs). They can be combined with any of the features and sorting options from the Filters section.
      </p>

      <form onSubmit={handleSearch} className="space-y-8">
        
        {/* Search Terms Section */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-lg font-medium text-white">
            <Search size={18} className="text-blue-400" /> Search terms
          </label>
          
          <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-800 space-y-4">
            {searchTerms.map((term, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-gray-500 w-4">{index + 1}</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const newTerms = [...searchTerms];
                    newTerms[index] = e.target.value;
                    setSearchTerms(newTerms);
                  }}
                  className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. software company"
                />
                <button 
                  type="button"
                  onClick={() => removeSearchField(index)}
                  className="p-2 hover:bg-red-900/20 rounded-md text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={addSearchField}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                <Plus size={16} /> Add
              </button>
              <button
                type="button"
                className="bg-[#2a2a2a] hover:bg-[#333333] text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                Bulk edit
              </button>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-lg font-medium text-white">
            <MapPin size={18} className="text-red-500" /> Location (use only one location per run)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-md py-3 px-4 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Number of Places Section */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-lg font-medium text-white">
            <List size={18} className="text-orange-500" /> Number of places to extract
          </label>
          <div className="w-48">
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-800 rounded-md py-3 px-4 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Button (Optional but recommended) */}
        <button 
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-all shadow-lg"
        >
          Start Extraction
        </button>

      </form>
    </div>
  );
}

export default CreateData;