import { Mic, ArrowRight, Star, Clock, Shield, Bot, Sparkles, Zap, MessageSquare, Users, TrendingUp, Workflow, Check, Code, Globe, Headphones } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #10b981 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transition: 'background-position 0.3s ease'
          }}></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-32 left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[calc(100vh-4rem)]">
            {/* Left Content */}
            <div className={`space-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center px-5 py-2 bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2.5 animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-900">Visual Flow Editor Now Available</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight">
                  Build Smart
                  <span className="block bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
                    AI Agents
                  </span>
                  <span className="block text-5xl lg:text-6xl mt-2 text-gray-700">Visually</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Design conversation flows with drag-and-drop simplicity. Configure tools, deploy agents, and manage everything in one place.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Workflow, text: 'Visual Flows', color: 'emerald' },
                  { icon: Clock, text: '5 Min Setup', color: 'green' },
                  { icon: Shield, text: 'Custom Tools', color: 'teal' }
                ].map((feature, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200/50 shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <feature.icon size={16} className={`text-${feature.color}-600`} />
                    <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => router.push('/voice')}
                  className="group relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
                >
                  <Mic size={20} />
                  <span>Try Voice Agent</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <button 
                  onClick={() => router.push('/chatbot')}
                  className="group flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold border border-emerald-200 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5"
                >
                  <Bot size={20} />
                  <span>Try Chatbot</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-12 pt-6">
                {[
                  { value: '100+', label: 'Agents' },
                  { value: '4.9', label: 'Rating', icon: '⭐' },
                  { value: '15+', label: 'Industries' }
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center gap-1">
                      {stat.value}
                      {stat.icon && <span className="text-lg">{stat.icon}</span>}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Main Card */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-1 shadow-2xl shadow-emerald-600/10 border border-emerald-200/50 hover:shadow-emerald-600/20 transition-all duration-500">
                  <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-[22px] p-8 relative overflow-hidden">
                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.1) 15px, rgba(255,255,255,0.1) 30px)'
                      }}></div>
                    </div>

                    {/* Central Feature */}
                    <div className="relative h-96 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                      
                      {/* Main Icon */}
                      <div className="relative z-20">
                        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                          <Workflow size={56} className="text-emerald-600" />
                        </div>
                        <div className="mt-6 text-center">
                          <div className="text-white font-bold text-xl mb-1">Visual Flow Builder</div>
                          <div className="text-white/90 text-sm font-light">Drag, Drop, Deploy</div>
                        </div>
                      </div>

                      {/* Floating Node Elements */}
                      {[
                        { icon: '🎯', position: 'top-8 left-8', delay: '0s', label: 'Start' },
                        { icon: '🔧', position: 'top-16 right-10', delay: '0.3s', label: 'Tools' },
                        { icon: '💬', position: 'bottom-16 left-12', delay: '0.6s', label: 'Chat' },
                        { icon: '✅', position: 'bottom-8 right-8', delay: '0.9s', label: 'End' }
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          className={`absolute ${item.position} group/item`}
                          style={{
                            animation: `float 4s ease-in-out infinite`,
                            animationDelay: item.delay
                          }}
                        >
                          <div className="relative">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer">
                              {item.icon}
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                              <span className="text-xs text-white font-medium whitespace-nowrap bg-black/50 px-2 py-1 rounded">
                                {item.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Connection Lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity: 0.2}}>
                        <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5">
                          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                        </line>
                        <line x1="75%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5">
                          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                        </line>
                        <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="white" strokeWidth="2" strokeDasharray="5,5">
                          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                        </line>
                        <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="white" strokeWidth="2" strokeDasharray="5,5">
                          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite" />
                        </line>
                      </svg>

                      {/* Pulse Ring */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-48 h-48 border-2 border-white/20 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div className="absolute -top-4 -left-4 w-28 h-28 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center border border-emerald-200/50 hover:scale-105 transition-transform duration-300">
                <MessageSquare className="text-emerald-600 mb-1.5" size={28} />
                <span className="text-xs font-semibold text-gray-700">Chat AI</span>
              </div>
              
              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center border border-emerald-200/50 hover:scale-105 transition-transform duration-300">
                <Zap className="text-green-600 mb-1.5" size={28} />
                <span className="text-xs font-semibold text-gray-700">Instant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 43.3C840 46.7 960 53.3 1080 56.7C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="url(#gradient1)"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f0fdf4" />
                <stop offset="50%" stopColor="#ccfbf1" />
                <stop offset="100%" stopColor="#d1fae5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build, configure, and deploy AI agents with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Workflow,
                title: 'Visual Flow Editor',
                description: 'Design conversation flows with intuitive drag-and-drop interface',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                icon: Mic,
                title: 'Voice Intelligence',
                description: 'Natural conversations with advanced speech recognition',
                gradient: 'from-green-500 to-teal-500'
              },
              {
                icon: Bot,
                title: 'Smart Chat',
                description: 'Context-aware chatbots that understand and respond',
                gradient: 'from-teal-500 to-emerald-500'
              },
              {
                icon: Zap,
                title: 'Custom Tools',
                description: 'Integrate APIs and create custom functions easily',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                icon: Users,
                title: 'Multi-Channel',
                description: 'Deploy to web, mobile, phone, and messaging platforms',
                gradient: 'from-green-500 to-teal-500'
              },
              {
                icon: TrendingUp,
                title: 'Analytics',
                description: 'Track performance and optimize agent interactions',
                gradient: 'from-teal-500 to-emerald-500'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-100/50 via-teal-100/50 to-green-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get your AI agent up and running in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {item.step}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-xl flex items-center justify-center mb-4 ml-8`}>
                    <item.icon className={`text-${item.color}-600`} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-emerald-400" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Every Industry
            </h2>
            <p className="text-lg text-gray-600">
              Customize AI agents for your specific business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🍕', title: 'Restaurants', desc: 'Orders & Reservations' },
              { icon: '🏥', title: 'Healthcare', desc: 'Appointments & FAQs' },
              { icon: '🛍️', title: 'E-commerce', desc: 'Product Support' },
              { icon: '🏦', title: 'Finance', desc: 'Account Queries' },
              { icon: '🏫', title: 'Education', desc: 'Student Services' },
              { icon: '🏨', title: 'Hospitality', desc: 'Booking & Info' },
              { icon: '🚗', title: 'Automotive', desc: 'Service Scheduling' },
              { icon: '💼', title: 'Real Estate', desc: 'Property Inquiries' }
            ].map((useCase, idx) => (
              <div 
                key={idx}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-emerald-200/50 hover:border-emerald-300 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{useCase.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow Editor Showcase */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-100/60 via-green-100/60 to-teal-100/60 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-4">
              <Workflow className="text-white" size={28} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Visual Flow Editor
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Design sophisticated conversation flows without writing code
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: 'Drag & Drop',
                description: 'Build flows by connecting nodes visually',
                icon: '🎯'
              },
              {
                title: 'Organize Tools',
                description: 'Group functions into logical workflow steps',
                icon: '🔧'
              },
              {
                title: 'Control Flow',
                description: 'Define transitions and conversation states',
                icon: '⚡'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-emerald-200/50 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/assistants')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Workflow size={20} className="mr-2" />
              Access Flow Editor
              <ArrowRight size={16} className="ml-2" />
            </button>
            <p className="text-sm text-gray-600 mt-3">Select an assistant to start building flows</p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-16 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '500+', label: 'Active Users' },
              { icon: Bot, value: '100+', label: 'Agents Created' },
              { icon: MessageSquare, value: '10K+', label: 'Conversations' },
              { icon: Star, value: '4.9/5', label: 'User Rating' }
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join businesses transforming customer interactions with AI agents
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/voice')}
              className="group inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              <Mic size={20} />
              <span>Get Started Free</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            <button 
              onClick={() => router.push('/assistants')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              View Demo
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="mt-6 text-white/70 text-sm">
            No credit card • 5 min setup • Cancel anytime
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;