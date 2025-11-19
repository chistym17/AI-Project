import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const INPUT_BASE_CLASSES =
  'w-full rounded-lg border px-3.5 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all';
const INPUT_STYLE = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderColor: 'rgba(145, 158, 171, 0.2)'
};

const TEXTAREA_BASE_CLASSES =
  'w-full rounded-lg border px-3.5 py-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all resize-none';
const TEXTAREA_STYLE = {
  background: 'rgba(255, 255, 255, 0.04)',
  borderColor: '#FFFFFF'
};

// Custom Dropdown Component
function CustomSelectDropdown({ value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : (placeholder || 'Select Type');

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${INPUT_BASE_CLASSES} flex items-center justify-between`}
        style={INPUT_STYLE}
      >
        <span className="text-left flex-1">{displayText}</span>
        <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{
            background: '#2D3748',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3.5 py-2.5 text-left text-sm text-white hover:bg-emerald-500/20 transition-colors"
              style={{
                background: value === option.value 
                  ? 'rgba(19, 245, 132, 0.2)' 
                  : 'transparent',
                color: value === option.value ? '#9EFBCD' : '#FFFFFF'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const AssistantProfileForm = ({ assistant = null, isOpen, onSave, onCancel }) => {
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
    } else {
      setFormData({
        name: '',
        description: '',
        business_meta: {
          industry_type: '',
          operating_hours: '',
          address: '',
          logo_url: ''
        }
      });
    }
  }, [assistant, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      onSave(savedAssistant);
      onCancel();
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[1012px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner Frame */}
        <div className="flex flex-col gap-2 p-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Public Sans', lineHeight: '1.5em' }}>
                Create/Edit Asistance
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Basic Information Section */}
            <div className="flex gap-16">
              {/* Section Label */}
              <div className="w-[150px] flex-shrink-0">
                <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Public Sans', lineHeight: '1.5em' }}>
                  Basic Information
                </h3>
              </div>

              {/* Fields */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Name Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ex: voice"
                    className={INPUT_BASE_CLASSES}
                    style={INPUT_STYLE}
                  />
                </div>

                {/* Industry Type Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Industry Type
                  </label>
                  <CustomSelectDropdown
                    value={formData.business_meta.industry_type}
                    options={[
                      { value: '', label: 'Select Type' },
                      { value: 'restaurant', label: 'Restaurant & Food Service' },
                      { value: 'retail', label: 'Retail & E-commerce' },
                      { value: 'healthcare', label: 'Healthcare' },
                      { value: 'education', label: 'Education' },
                      { value: 'finance', label: 'Finance & Banking' },
                      { value: 'technology', label: 'Technology' },
                      { value: 'other', label: 'Other' }
                    ]}
                    onChange={(value) => handleInputChange('business_meta.industry_type', value)}
                    placeholder="Select Type"
                  />
                </div>

                {/* Description Field */}
                <div className="flex flex-col gap-2.5" style={{ height: '177px' }}>
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description"
                    className={TEXTAREA_BASE_CLASSES}
                    style={TEXTAREA_STYLE}
                  />
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div className="flex gap-16 pt-4">
              {/* Section Label */}
              <div className="w-[150px] flex-shrink-0">
                <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Public Sans', lineHeight: '1.5em' }}>
                  Business Details
                </h3>
              </div>

              {/* Fields */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Operating Hours Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.business_meta.operating_hours}
                    onChange={(e) => handleInputChange('business_meta.operating_hours', e.target.value)}
                    placeholder="ex: 10 am to 8 pm"
                    className={INPUT_BASE_CLASSES}
                    style={INPUT_STYLE}
                  />
                </div>

                {/* Address Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Adress
                  </label>
                  <input
                    type="text"
                    value={formData.business_meta.address}
                    onChange={(e) => handleInputChange('business_meta.address', e.target.value)}
                    placeholder="ex:"
                    className={INPUT_BASE_CLASSES}
                    style={INPUT_STYLE}
                  />
                </div>

                {/* Logo URL Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Public Sans', lineHeight: '1em', width: '98px' }}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.business_meta.logo_url}
                    onChange={(e) => handleInputChange('business_meta.logo_url', e.target.value)}
                    placeholder="www.logo.com/esap"
                    className={INPUT_BASE_CLASSES}
                    style={INPUT_STYLE}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-2.5 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center"
                style={{
                  background: 'rgba(255, 86, 48, 0.08)',
                  color: '#FFAC82',
                  height: '36px',
                  fontFamily: 'Public Sans',
                  lineHeight: '1.7142857142857142em'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(19, 245, 132, 0.08)',
                  color: '#9EFBCD',
                  height: '36px',
                  fontFamily: 'Public Sans',
                  lineHeight: '1.7142857142857142em'
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  assistant ? 'Update Asistance' : 'Create Asistance'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssistantProfileForm; 