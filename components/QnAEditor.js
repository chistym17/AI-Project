import React, { useState, useEffect } from 'react';
import { Save, X, MessageSquare, HelpCircle, MessageCircle, Tag, Sparkles, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const QnAEditor = ({ assistantId, qa = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (qa) {
      setFormData({
        question: qa.question || '',
        answer: qa.answer || '',
        category: qa.category || ''
      });
    }
  }, [qa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = qa 
        ? API_ENDPOINTS.QA_UPDATE(assistantId, qa.id)
        : API_ENDPOINTS.QA_CREATE(assistantId);
      
      const method = qa ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save Q&A');
      }

      const savedQa = await response.json();
      setShowSuccess(true);
      setTimeout(() => {
        onSave(savedQa);
      }, 1000);
    } catch (error) {
      console.error('Error saving Q&A:', error);
      alert('Failed to save Q&A. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-4 text-center animate-scale-in shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">
            Q&A {qa ? 'updated' : 'created'} successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-green-100 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-t-3xl"></div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-emerald-600 bg-clip-text text-transparent">
                  {qa ? 'Edit Q&A Entry' : 'Create New Q&A'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {qa ? 'Update your knowledge base entry' : 'Add a new question and answer pair'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-3 rounded-xl hover:bg-white/50 transition-all duration-200 group"
            >
              <X size={24} className="text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
          {/* Question Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Question</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>
            
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What question will users ask? *
              </label>
              <div className="relative">
                <textarea
                  required
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  onFocus={() => setFocusedField('question')}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none resize-none ${
                    focusedField === 'question'
                      ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="e.g., What are your operating hours?"
                />
                {focusedField === 'question' && (
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                )}
                <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                  {formData.question.length} characters
                </div>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Answer</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
            </div>
            
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How should the AI respond? *
              </label>
              <div className="relative">
                <textarea
                  required
                  value={formData.answer}
                  onChange={(e) => handleInputChange('answer', e.target.value)}
                  onFocus={() => setFocusedField('answer')}
                  onBlur={() => setFocusedField(null)}
                  rows={5}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none resize-none ${
                    focusedField === 'answer'
                      ? 'border-green-400 focus:ring-4 focus:ring-green-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="e.g., We're open Monday to Friday from 9AM to 6PM, and weekends from 10AM to 4PM. Feel free to visit us during these hours or contact us anytime!"
                />
                {focusedField === 'answer' && (
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 animate-scale-x"></div>
                )}
                <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                  {formData.answer.length} characters
                </div>
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Tag size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Category</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
            </div>
            
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organize with a category (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  onFocus={() => setFocusedField('category')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                    focusedField === 'category'
                      ? 'border-purple-400 focus:ring-4 focus:ring-purple-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="e.g., Hours, Pricing, Services, Support"
                />
                {focusedField === 'category' && (
                  <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500 animate-scale-x"></div>
                )}
              </div>
              
              {/* Category Suggestions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {['Hours', 'Pricing', 'Services', 'Support', 'Policies'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleInputChange('category', suggestion)}
                    className="px-3 py-1 text-xs bg-white/60 hover:bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="group px-8 py-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 font-medium"
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
                  <span>{qa ? 'Update Q&A' : 'Create Q&A'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-200/50">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-green-500 mt-0.5 animate-pulse" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">💡 Pro Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Write questions as users would naturally ask them</li>
                  <li>• Keep answers clear, helpful, and on-brand</li>
                  <li>• Use categories to organize related Q&As</li>
                  <li>• Test your Q&As after saving to ensure they work well</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

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
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default QnAEditor;