import React, { useState, useRef } from 'react';
import { Advertisement, AdType, AdSize, ADMIN_EMAIL } from '../types';
import { fileToBase64, getYouTubeId } from '../utils';
import { X, Upload, MonitorPlay, Image as ImageIcon, Trash2, LogOut, Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  ads: Advertisement[];
  onAdd: (ad: Omit<Advertisement, 'id'>) => Promise<void>;
  onRemove: (id: string, url: string) => void;
  onUpload: (file: File) => Promise<string>;
  onClose: () => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ ads, onAdd, onRemove, onUpload, onClose, onLogout }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: AdType.IMAGE,
    url: '',
    size: AdSize.SMALL
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Store the actual file for upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        // Just for preview purposes
        const base64 = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, url: base64 }));
      } catch (err) {
        alert("Failed to read file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setUploadProgress('Validating...');

    try {
      // Validation
      if (!formData.title) throw new Error("Title is required");
      
      let finalUrl = formData.url;

      // Handle File Upload if it's an Image and a file is selected
      if (formData.type === AdType.IMAGE) {
        const file = fileInputRef.current?.files?.[0];
        
        // If there is a file selected, upload it
        if (file) {
           setUploadProgress('Uploading image to cloud...');
           finalUrl = await onUpload(file);
        } else if (!formData.url) {
           throw new Error("Please select an image or enter a URL");
        }
      } else if (formData.type === AdType.VIDEO) {
        if (!getYouTubeId(formData.url)) throw new Error("Please enter a valid YouTube URL");
      }

      setUploadProgress('Saving to billboard...');

      const newAd: Omit<Advertisement, 'id'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: finalUrl,
        size: formData.size,
        createdAt: Date.now()
      };

      await onAdd(newAd);
      
      // Reset form
      setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          url: '', 
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadProgress('');

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Billboard Command Center</h2>
              <p className="text-gray-400">Admin: {ADMIN_EMAIL}</p>
            </div>
            <div className="flex space-x-4">
               <button 
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition"
              >
                <LogOut size={18} className="mr-2"/> Logout
              </button>
              <button 
                onClick={onClose}
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
              >
                <X size={18} className="mr-2"/> Close & View Board
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit shadow-xl relative overflow-hidden">
              {isSubmitting && (
                <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center">
                   <Loader2 size={40} className="text-neon-blue animate-spin mb-4" />
                   <p className="text-neon-blue font-mono text-sm">{uploadProgress}</p>
                </div>
              )}

              <h3 className="text-xl font-semibold text-neon-blue mb-6 flex items-center">
                <Upload className="mr-2" /> Register New Ad
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Ad Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: AdType.IMAGE})}
                      className={`py-3 px-4 rounded-lg border flex items-center justify-center ${formData.type === AdType.IMAGE ? 'bg-neon-purple/20 border-neon-purple text-white' : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}
                    >
                      <ImageIcon size={20} className="mr-2" /> Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: AdType.VIDEO})}
                      className={`py-3 px-4 rounded-lg border flex items-center justify-center ${formData.type === AdType.VIDEO ? 'bg-neon-pink/20 border-neon-pink text-white' : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}
                    >
                      <MonitorPlay size={20} className="mr-2" /> Video (YT)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Size on Board</label>
                  <select 
                    name="size" 
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-neon-blue focus:outline-none"
                  >
                    <option value={AdSize.SMALL}>Standard (1x1)</option>
                    <option value={AdSize.WIDE}>Wide (2x1)</option>
                    <option value={AdSize.TALL}>Tall (1x2)</option>
                    <option value={AdSize.LARGE}>Billboard (2x2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Brand / Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Coca Cola"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-neon-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
                  {formData.type === AdType.IMAGE ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <input 
                          type="text"
                          name="url"
                          value={formData.url.startsWith('data:') ? '(File Selected)' : formData.url}
                          onChange={handleInputChange}
                          placeholder="Image URL (optional)"
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-neon-blue focus:outline-none"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">URL</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-gray-500 uppercase">- OR UPLOAD -</div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-neon-blue hover:file:bg-gray-700 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-neon-pink focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tagline (Optional)</label>
                  <textarea 
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Short promotional text..."
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-neon-blue focus:outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition transform hover:scale-[1.02] disabled:opacity-50"
                >
                  Publish to Board
                </button>
              </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
               <h3 className="text-xl font-semibold text-white mb-6">Active Campaigns ({ads.length})</h3>
               
               <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl max-h-[600px] overflow-y-auto">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-gray-800 text-xs uppercase font-medium text-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Preview</th>
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Size</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {ads.map((ad) => (
                          <tr key={ad.id} className="hover:bg-gray-800/50 transition">
                            <td className="px-6 py-4">
                              <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden">
                                {ad.type === AdType.IMAGE ? (
                                  <img src={ad.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-red-900/50 text-red-500">
                                    <MonitorPlay size={16} />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{ad.title}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${ad.type === AdType.VIDEO ? 'bg-neon-pink/10 text-neon-pink' : 'bg-neon-blue/10 text-neon-blue'}`}>
                                {ad.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">{ad.size}</td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => onRemove(ad.id, ad.url)}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/30 rounded-full transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {ads.length === 0 && (
                           <tr>
                             <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                               No active advertisements. Add one to get started.
                             </td>
                           </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;