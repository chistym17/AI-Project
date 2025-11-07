import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Wrench, Workflow, Sparkles, ChevronRight } from 'lucide-react';

const tabs = [
  { 
    key: 'qa', 
    label: 'Q&A', 
    icon: MessageCircle,
    description: 'Knowledge & Responses',
    colors: {
      light: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      textActive: 'text-blue-700',
      indicator: 'bg-blue-500',
      shadow: 'shadow-blue-200'
    }
  },
  { 
    key: 'tools', 
    label: 'Tools', 
    icon: Wrench,
    description: 'Integrations & APIs',
    colors: {
      light: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      textActive: 'text-purple-700',
      indicator: 'bg-purple-500',
      shadow: 'shadow-purple-200'
    }
  },
  { 
    key: 'flows', 
    label: 'Visual Flows', 
    icon: Workflow,
    description: 'Conversation Logic',
    colors: {
      light: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      textActive: 'text-emerald-700',
      indicator: 'bg-emerald-500',
      shadow: 'shadow-emerald-200'
    }
  },
];

const AssistantTabs = ({ initial = 'qa', onChange }) => {
  const [active, setActive] = useState(initial);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef([]);

  const select = (key) => {
    setActive(key);
    onChange?.(key);
  };

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === active);
    const activeTab = tabsRef.current[activeIndex];
    
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [active]);

  const getActiveTab = () => tabs.find(tab => tab.key === active);

  return (
    <div className="w-full  rounded-3xl p-8 mb-8 backdrop-blur-sm border border-white/20">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className={`w-14 h-14 bg-gradient-to-br ${getActiveTab()?.colors.light} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300`}>
              {React.createElement(getActiveTab()?.icon, { 
                size: 24, 
                className: "text-white" 
              })}
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 ${getActiveTab()?.colors.indicator} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {getActiveTab()?.label}
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-slate-600 text-sm">{getActiveTab()?.description}</p>
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-slate-200/50">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-slate-700 font-medium">AI Configuration</span>
        </div>
      </div>

      {/* Modern Toggle Switch Design */}
      <div className="relative">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-slate-200/30">
          {/* Sliding Active Indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r ${getActiveTab()?.colors.light} rounded-xl shadow-md transition-all duration-300 ease-out`}
            style={indicatorStyle}
          />
          
          {/* Tab Buttons */}
          <div className="relative flex">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;
              const isHovered = hoveredTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  ref={el => tabsRef.current[index] = el}
                  onClick={() => select(tab.key)}
                  onMouseEnter={() => setHoveredTab(tab.key)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive 
                      ? 'text-white z-10' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon 
                      size={16} 
                      className={`transition-all duration-200 ${
                        isActive 
                          ? 'text-white' 
                          : isHovered 
                          ? 'text-slate-600' 
                          : 'text-slate-400'
                      }`} 
                    />
                    <span className={`transition-all duration-200 ${
                      isActive 
                        ? 'font-semibold text-white' 
                        : isHovered 
                        ? 'font-medium text-slate-700' 
                        : 'font-normal'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimalistic Progress Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {tabs.map((tab, index) => (
            <div 
              key={`progress-${tab.key}`} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                active === tab.key 
                  ? `${tab.colors.indicator} scale-125` 
                  : 'bg-slate-300 hover:bg-slate-400 cursor-pointer'
              }`}
              onClick={() => select(tab.key)}
            />
          ))}
        </div>
      </div>

      {/* Clean Status Indicator */}
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200/30">
          <div className={`w-2 h-2 ${getActiveTab()?.colors.indicator} rounded-full animate-pulse`} />
          <span className="text-xs font-medium text-slate-600">
            {getActiveTab()?.description}
          </span>
        </div>
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-6 left-6 w-24 h-24 bg-gradient-to-tr from-emerald-100/30 to-blue-100/30 rounded-full blur-2xl opacity-40"></div>
    </div>
  );
};

export default AssistantTabs;