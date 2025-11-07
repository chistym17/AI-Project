import { Bot, Workflow, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const HowItWorks = () => {
  const [animationStates, setAnimationStates] = useState({
    step1: false,
    step2: false,
    step3: false,
    isVisible: false
  });
  
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const steps = [
    {
      step: '1',
      title: 'Create Assistant',
      description: 'Set up your AI agent with a name, description, and business context',
      icon: Bot,
      color: 'emerald'
    },
    {
      step: '2',
      title: 'Design Flows',
      description: 'Use the visual editor to create conversation flows and connect tools',
      icon: Workflow,
      color: 'green'
    },
    {
      step: '3',
      title: 'Deploy & Test',
      description: 'Launch your agent on voice or chat and start serving customers',
      icon: Zap,
      color: 'teal'
    }
  ];

  const startAnimation = () => {
    setHasAnimated(true);
    setAnimationStates({
      step1: false,
      step2: false,
      step3: false,
      isVisible: true
    });

    // Sequential animation timing
    setTimeout(() => setAnimationStates(prev => ({ ...prev, step1: true })), 200);
    setTimeout(() => setAnimationStates(prev => ({ ...prev, step2: true })), 600);
    setTimeout(() => setAnimationStates(prev => ({ ...prev, step3: true })), 1000);
  };

  useEffect(() => {
    // Observer for section header
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationStates(prev => ({ ...prev, isVisible: true }));
        } else {
          setAnimationStates(prev => ({ ...prev, isVisible: false }));
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      sectionObserver.observe(sectionRef.current);
    }

    // Observers for individual steps
    const stepRefs = [
      sectionRef.current?.querySelector('[data-step="0"]'),
      sectionRef.current?.querySelector('[data-step="1"]'), 
      sectionRef.current?.querySelector('[data-step="2"]')
    ];

    const stepObservers = stepRefs.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Add step to visible list with stagger
            setTimeout(() => {
              setAnimationStates(prev => {
                const newState = { ...prev };
                if (index === 0 && !newState.step1) {
                  newState.step1 = true;
                }
                if (index === 1 && !newState.step2) {
                  newState.step2 = true;
                }
                if (index === 2 && !newState.step3) {
                  newState.step3 = true;
                }
                return newState;
              });
            }, index * 300);
          } else {
            // Remove step from visible list when out of viewport
            setAnimationStates(prev => {
              const newState = { ...prev };
              if (index === 0) {
                newState.step1 = false;
              }
              if (index === 1) {
                newState.step2 = false;
              }
              if (index === 2) {
                newState.step3 = false;
              }
              return newState;
            });
          }
        },
        { 
          threshold: 0.3,
          rootMargin: '-50px 0px -50px 0px'
        }
      );
      
      if (ref) observer.observe(ref);
      return observer;
    });

    return () => {
      sectionObserver.disconnect();
      stepObservers.forEach(observer => observer?.disconnect());
    };
  }, []);

  const StepCard = ({ item, index, isVisible }) => (
    <div className={`relative transform transition-all duration-1000 ease-in-out ${
      isVisible 
        ? 'translate-x-0 translate-y-0 scale-100 opacity-100' 
        : index === 0 
          ? '-translate-x-12 opacity-0'
          : index === 1
            ? 'translate-y-6 scale-98 opacity-0'
            : 'translate-x-12 opacity-0'
    }`}>
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-200/50 hover:border-emerald-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
        
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        
        {/* Step Number Badge */}
        <div className={`absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform transition-all duration-700 ease-in-out ${
          isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
        }`}>
          <span className={`transition-all duration-500 delay-300 ease-in-out ${isVisible ? 'scale-100' : 'scale-0'}`}>
            {item.step}
          </span>
        </div>

        {/* Icon Container */}
        <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-2xl flex items-center justify-center mb-6 ml-10 shadow-lg transform transition-all duration-800 delay-200 ease-in-out ${
          isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
        }`}>
          <item.icon className={`text-${item.color}-600 transition-all duration-600 delay-400 ease-in-out ${
            isVisible ? 'scale-100' : 'scale-0'
          }`} size={36} />
        </div>

        {/* Content */}
        <div className={`relative z-10 transform transition-all duration-800 delay-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
            {item.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            {item.description}
          </p>
        </div>

        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-${item.color}-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
      </div>
    </div>
  );


  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-emerald-100/60 via-teal-100/60 to-green-100/60 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center mb-20 transform transition-all duration-1000 ${
          animationStates.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full mb-6">
            <span className="text-sm font-semibold text-emerald-700">Simple Setup, Powerful Agents</span>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your AI agent up and running in minutes
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Step 1 */}
          <div data-step="0">
            <StepCard 
              item={steps[0]} 
              index={0} 
              isVisible={animationStates.step1} 
            />
          </div>

          {/* Step 2 */}
          <div data-step="1">
            <StepCard 
              item={steps[1]} 
              index={1} 
              isVisible={animationStates.step2} 
            />
          </div>

          {/* Step 3 */}
          <div data-step="2">
            <StepCard 
              item={steps[2]} 
              index={2} 
              isVisible={animationStates.step3} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
