import { Workflow, Mic, MessageSquare, Zap, Brain, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Features = () => {
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  const featureRefs = useRef([]);

  const features = [
    {
      id: 1,
      icon: Workflow,
      title: 'Voice + Visual Flow',
      description: 'Structured conversations with visual workflow control',
      gradient: 'from-emerald-500 to-green-600',
      layout: 'content-left',
      highlights: [
        { icon: Workflow, text: 'Drag & drop flows' },
        { icon: Zap, text: 'Instant deployment' }
      ]
    },
    {
      id: 2,
      icon: Mic,
      title: 'Voice + Natural Mode',
      description: 'Creative conversations that adapt and flow naturally',
      gradient: 'from-green-500 to-teal-600',
      layout: 'content-right',
      highlights: [
        { icon: Brain, text: 'AI-powered responses' },
        { icon: Users, text: 'Human-like interaction' }
      ]
    },
    {
      id: 3,
      icon: MessageSquare,
      title: 'Chat Agent',
      description: 'Quick text interactions for instant customer support',
      gradient: 'from-teal-500 to-emerald-600',
      layout: 'content-left',
      highlights: [
        { icon: CheckCircle, text: 'Instant responses' },
        { icon: MessageSquare, text: 'Multi-platform ready' }
      ]
    }
  ];

  useEffect(() => {
    const observers = featureRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Add feature to visible list with stagger
            setTimeout(() => {
              setVisibleFeatures(prev => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }, index * 200);
          } else {
            // Remove feature from visible list when out of viewport
            setVisibleFeatures(prev => prev.filter(i => i !== index));
          }
        },
        { 
          threshold: 0.3,
          rootMargin: '-50px 0px -50px 0px' // Trigger slightly inside viewport
        }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const FeatureImage = ({ feature, index }) => {
    const imageMap = {
      0: '/images/img1.png',
      1: '/images/flow2.png', 
      2: '/images/flow5.png'
    };

    return (
      <div className="relative">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={imageMap[index]} 
            alt={`${feature.title} demonstration`}
            className="w-full h-full object-contain object-center"
            style={{
              imageRendering: 'crisp-edges',
              WebkitImageRendering: 'crisp-edges',
              MozImageRendering: 'crisp-edges'
            }}
            loading="lazy"
          />
          {/* Overlay gradient for better contrast */}
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20`}></div>
        </div>
        {/* Floating accent */}
        <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <feature.icon size={24} className="text-white" />
        </div>
      </div>
    );
  };

  const FeatureContent = ({ feature, index }) => (
    <div className="space-y-8">
      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
            <feature.icon size={28} className="text-white" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 leading-tight">
            {feature.title}
          </h3>
        </div>
        
        <p className="text-xl text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-4">
        {feature.highlights.map((highlight, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <highlight.icon size={16} className="text-emerald-600" />
            </div>
            <span className="text-lg text-gray-700">
              <span className="font-semibold">{highlight.text.split(' ')[0]}</span>
              {highlight.text.split(' ').length > 1 && (
                <span className="font-normal"> {highlight.text.split(' ').slice(1).join(' ')}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <div className="pt-4">
        <div className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}>
          <feature.icon size={22} className="mr-3" />
          Try Now
          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Three Ways to Build
          </h2>
          <p className="text-xl text-gray-600">
            Choose the perfect mode for your business needs
          </p>
        </div>

        {/* Features */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={el => featureRefs.current[index] = el}
              className="relative"
            >
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {feature.layout === 'content-left' ? (
                  <>
                    {/* Content Left */}
                    <div className={`transform transition-all duration-1000 ${
                      visibleFeatures.includes(index) 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-16 opacity-0'
                    }`}>
                      <FeatureContent feature={feature} index={index} />
                    </div>
                    
                    {/* Image Right */}
                    <div className={`transform transition-all duration-1000 delay-200 ${
                      visibleFeatures.includes(index) 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-16 opacity-0'
                    }`}>
                      <FeatureImage feature={feature} index={index} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Image Left */}
                    <div className={`transform transition-all duration-1000 ${
                      visibleFeatures.includes(index) 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-16 opacity-0'
                    }`}>
                      <FeatureImage feature={feature} index={index} />
                    </div>
                    
                    {/* Content Right */}
                    <div className={`transform transition-all duration-1000 delay-200 ${
                      visibleFeatures.includes(index) 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-16 opacity-0'
                    }`}>
                      <FeatureContent feature={feature} index={index} />
                    </div>
                  </>
                )}
              </div>
              
              {/* Separator Line */}
              {index < features.length - 1 && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-px h-16 bg-gradient-to-b from-emerald-200 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
