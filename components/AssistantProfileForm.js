import React, { useState, useEffect } from 'react';
import { Save, X, Building2, Clock, MapPin, Upload, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const AssistantProfileForm = ({ assistant = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_meta: {
      industry_type: '',
      operating_hours: '',
      address: '',
      logo_url: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (assistant) {
      setFormData({
        name: assistant.name || '',
        description: assistant.description || '',
        business_meta: {
          industry_type: assistant.business_meta?.industry_type || '',
          operating_hours: assistant.business_meta?.operating_hours || '',
          address: assistant.business_meta?.address || '',
          logo_url: assistant.business_meta?.logo_url || ''
        }
      });
    }
  }, [assistant]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Assistant name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const url = assistant 
        ? API_ENDPOINTS.ASSISTANT(assistant.id)
        : API_ENDPOINTS.ASSISTANTS;
      
      const method = assistant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save assistant');
      }

      const savedAssistant = await response.json();
      setShowSuccess(true);
      setTimeout(() => {
        onSave(savedAssistant);
      }, 1000);
    } catch (error) {
      console.error('Error saving assistant:', error);
      alert('Failed to save assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getIndustryIcon = (industryType) => {
    const icons = {
      restaurant: '🍽️',
      retail: '🛍️',
      healthcare: '🏥',
      education: '🎓',
      finance: '💰',
      technology: '💻',
      other: '🏢'
    };
    return icons[industryType] || '🏢';
  };

  const getIndustryGradient = (industryType) => {
    const gradients = {
      restaurant: 'from-orange-400 to-red-500',
      retail: 'from-purple-400 to-pink-500',
      healthcare: 'from-blue-400 to-cyan-500',
      education: 'from-green-400 to-blue-500',
      finance: 'from-yellow-400 to-orange-500',
      technology: 'from-indigo-400 to-purple-500',
      other: 'from-gray-400 to-gray-600'
    };
    return gradients[industryType] || gradients.other;
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-green/90 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-4 text-center animate-scale-in shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">
            Assistant {assistant ? 'updated' : 'created'} successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 rounded-t-3xl"></div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
                {assistant ? <Sparkles className="w-7 h-7 text-white" /> : <Zap className="w-7 h-7 text-white" />}
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-emerald-600 bg-clip-text text-transparent">
                  {assistant ? 'Transform Assistant' : 'Create AI Assistant'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {assistant ? 'Update your intelligent business companion' : 'Build your intelligent business companion'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            >
              <X size={24} className="text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Assistant Name *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      formErrors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                        : focusedField === 'name'
                        ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="e.g., Sunrise Café AI Assistant"
                  />
                  {focusedField === 'name' && (
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                  )}
                </div>
                {formErrors.name && (
                  <p className="text-red-500 text-sm animate-shake">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Industry Type
                </label>
                <div className="relative group">
                  <select
                    value={formData.business_meta.industry_type}
                    onChange={(e) => handleInputChange('business_meta.industry_type', e.target.value)}
                    onFocus={() => setFocusedField('industry')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none appearance-none cursor-pointer ${
                      focusedField === 'industry'
                        ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select Industry</option>
                    <option value="restaurant">🍽️ Restaurant & Food Service</option>
                    <option value="retail">🛍️ Retail & E-commerce</option>
                    <option value="healthcare">🏥 Healthcare</option>
                    <option value="education">🎓 Education</option>
                    <option value="finance">💰 Finance & Banking</option>
                    <option value="technology">💻 Technology</option>
                    <option value="other">🏢 Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 transition-transform duration-200 group-focus-within:-rotate-45"></div>
                  </div>
                  {focusedField === 'industry' && (
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                  )}
                </div>
                {formData.business_meta.industry_type && (
                  <div className="flex items-center mt-2 animate-fade-in">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getIndustryGradient(formData.business_meta.industry_type)} rounded-lg flex items-center justify-center text-lg mr-2`}>
                      {getIndustryIcon(formData.business_meta.industry_type)}
                    </div>
                    <span className="text-sm text-gray-600 capitalize">{formData.business_meta.industry_type} Industry</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <div className="relative group">
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none resize-none ${
                    formErrors.description
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : focusedField === 'description'
                      ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Describe your business and what this AI assistant will help with. Be specific about services, target audience, and key features..."
                />
                {focusedField === 'description' && (
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                )}
                <div className="absolute bottom-2 right-4 text-xs text-gray-400">
                  {formData.description.length} characters
                </div>
              </div>
              {formErrors.description && (
                <p className="text-red-500 text-sm animate-shake">{formErrors.description}</p>
              )}
            </div>
          </div>

          {/* Business Details Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Business Details</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Clock size={16} className="text-blue-500" />
                  <span>Operating Hours</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.business_meta.operating_hours}
                    onChange={(e) => handleInputChange('business_meta.operating_hours', e.target.value)}
                    onFocus={() => setFocusedField('hours')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'hours'
                        ? 'border-blue-400 focus:ring-4 focus:ring-blue-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="e.g., Mon-Fri 9AM-6PM, Sat-Sun 10AM-4PM"
                  />
                  {focusedField === 'hours' && (
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 animate-scale-x"></div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="text-green-500" />
                  <span>Address / Location</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.business_meta.address}
                    onChange={(e) => handleInputChange('business_meta.address', e.target.value)}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                      focusedField === 'address'
                        ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="e.g., 123 Main St, City, State 12345"
                  />
                  {focusedField === 'address' && (
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Upload size={16} className="text-purple-500" />
                <span>Logo URL (Optional)</span>
              </label>
              <div className="relative group">
                <input
                  type="url"
                  value={formData.business_meta.logo_url}
                  onChange={(e) => handleInputChange('business_meta.logo_url', e.target.value)}
                  onFocus={() => setFocusedField('logo')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                    focusedField === 'logo'
                      ? 'border-purple-400 focus:ring-4 focus:ring-purple-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="https://example.com/logo.png"
                />
                {focusedField === 'logo' && (
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 animate-scale-x"></div>
                )}
              </div>
              {formData.business_meta.logo_url && (
                <div className="mt-2 animate-fade-in">
                  <img
                    src={formData.business_meta.logo_url}
                    alt="Logo preview"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="group px-8 py-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 font-medium"
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-200">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{assistant ? 'Update Assistant' : 'Create Assistant'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scale-x {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-scale-x {
          animation: scale-x 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AssistantProfileForm;