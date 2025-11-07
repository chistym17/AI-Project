import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Building2, Calendar, MapPin, Clock, MoreHorizontal, Zap, Activity } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { useRouter } from 'next/router';
import { useAssistant } from '../lib/assistantContext';

const AssistantList = ({ onEdit, onDelete, onView }) => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();
  const { assistantId, setAssistant } = useAssistant();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ASSISTANTS);
      if (!response.ok) {
        throw new Error('Failed to fetch assistants');
      }
      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      setError('Failed to load assistants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assistantIdToDelete) => {
    if (!confirm('Are you sure you want to delete this assistant?')) {
      return;
    }

    try {
      setDeletingId(assistantIdToDelete);
      const response = await fetch(API_ENDPOINTS.ASSISTANT(assistantIdToDelete), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assistant');
      }

      // Animate out and remove from local state
      setTimeout(() => {
        setAssistants(prev => prev.filter(assistant => assistant.id !== assistantIdToDelete));
        setDeletingId(null);
      }, 300);
    } catch (error) {
      console.error('Error deleting assistant:', error);
      alert('Failed to delete assistant. Please try again.');
      setDeletingId(null);
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
      default: '🏢'
    };
    return icons[industryType] || icons.default;
  };

  const getIndustryGradient = (industryType) => {
    const gradients = {
      restaurant: 'from-orange-400 to-red-500',
      retail: 'from-purple-400 to-pink-500',
      healthcare: 'from-blue-400 to-cyan-500',
      education: 'from-green-400 to-blue-500',
      finance: 'from-yellow-400 to-orange-500',
      technology: 'from-indigo-400 to-purple-500',
      default: 'from-gray-400 to-gray-600'
    };
    return gradients[industryType] || gradients.default;
  };

  const activate = (assistant) => {
    setAssistant(assistant);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-100">
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin animate-reverse" style={{animationDelay: '-0.5s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAssistants}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-100">
      <div className="container mx-auto px-6 py-8">
        {/* Animated Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-indigo-900 bg-clip-text text-transparent mb-2">
                AI Assistants
              </h1>
              <p className="text-gray-600">Manage and deploy your intelligent business assistants</p>
            </div>
            <button
              onClick={() => onEdit(null)}
              className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center">
                <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Assistant
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Content */}
        {assistants.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Building2 size={48} className="text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}>
                <Zap className="w-5 h-5 text-white m-1.5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No assistants yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Transform your business with AI-powered assistants. Create your first one to get started on this exciting journey.
            </p>
            <button
              onClick={() => onEdit(null)}
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center">
                <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Assistant
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {assistants.map((assistant, index) => (
              <div
                key={assistant.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 overflow-hidden animate-fade-in-up ${
                  deletingId === assistant.id ? 'animate-scale-out opacity-50' : ''
                } ${
                  assistantId === assistant.id ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
                onMouseEnter={() => setHoveredCard(assistant.id)}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setShowActions(null);
                }}
              >
                {/* Active Indicator */}
                {assistantId === assistant.id && (
                  <div className="absolute top-4 right-4 flex items-center">
                    <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Activity size={12} className="mr-1 animate-pulse" />
                      Active
                    </div>
                  </div>
                )}

                {/* Industry Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${getIndustryGradient(assistant.business_meta?.industry_type)}`}></div>

                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`relative w-14 h-14 bg-gradient-to-br ${getIndustryGradient(assistant.business_meta?.industry_type)} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                        {getIndustryIcon(assistant.business_meta?.industry_type)}
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                          {assistant.name}
                        </h3>
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600 capitalize">
                          {assistant.business_meta?.industry_type || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === assistant.id ? null : assistant.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                      
                      {showActions === assistant.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 animate-scale-in">
                          <button
                            onClick={() => {
                              router.push(`/assistants/${assistant.id}`);
                              setShowActions(null);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700 rounded-t-xl transition-colors duration-200"
                          >
                            <Eye size={16} className="mr-3 text-gray-400" />
                            Manage & Configure
                          </button>
                          <button
                            onClick={() => {
                              onEdit(assistant);
                              setShowActions(null);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700 transition-colors duration-200"
                          >
                            <Edit size={16} className="mr-3 text-blue-400" />
                            Edit Assistant
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(assistant.id);
                              setShowActions(null);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center text-sm text-red-600 rounded-b-xl transition-colors duration-200"
                          >
                            <Trash2 size={16} className="mr-3 text-red-400" />
                            Delete Assistant
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {assistant.description}
                  </p>

                  {/* Business Info */}
                  <div className="space-y-3 mb-6">
                    {assistant.business_meta?.operating_hours && (
                      <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                          <Clock size={12} className="text-blue-500" />
                        </div>
                        <span className="font-medium">Hours:</span>
                        <span className="ml-2">{assistant.business_meta.operating_hours}</span>
                      </div>
                    )}
                    
                    {assistant.business_meta?.address && (
                      <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <MapPin size={12} className="text-green-500" />
                        </div>
                        <span className="font-medium">Location:</span>
                        <span className="ml-2 truncate flex-1">{assistant.business_meta.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-2" />
                      <span>
                        Created {new Date(assistant.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => activate(assistant)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        assistantId === assistant.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {assistantId === assistant.id ? 'Active' : 'Set Active'}
                    </button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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
        
        @keyframes scale-out {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        
        .animate-scale-out {
          animation: scale-out 0.3s ease-out forwards;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AssistantList;