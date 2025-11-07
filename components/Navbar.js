import { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, AudioLines, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../lib/authContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, accessToken, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!accessToken);
  }, [accessToken]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 shadow-lg relative z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center group">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3 group-hover:bg-white/30 transition-colors duration-200">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">A</span>
                </div>
              </div>
              <span className="text-white font-bold text-xl group-hover:text-green-100 transition-colors duration-200">AI Agent Builder</span>
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="/"
                className="text-white hover:text-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10"
              >
                <Home size={18} />
                Home
              </a>
              <a
                href="/assistants"
                className="text-white hover:text-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10"
              >
                <Settings size={18} />
                Assistants
              </a>
              <a
                href="/voice"
                className="text-white hover:text-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10"
              >
                <AudioLines size={18} />
                Voice Agent
              </a>
              <a
                href="/chatbot"
                className="text-white hover:text-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10"
              >
                <MessageSquare size={18} />
                Chat Agent
              </a>
              
              <a
                href="#admin"
                className="text-white hover:text-green-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10"
              >
                <Settings size={18} />
                Admin
              </a>
              
              <button
                onClick={handleAuthClick}
                className="text-white hover:text-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/10 border border-white/30 hover:border-white/50 ml-2"
              >
                {isLoggedIn ? (
                  <>
                    <LogOut size={18} />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Login
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-100 p-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-b from-emerald-700 to-green-700 border-t border-white/10 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="text-white hover:text-green-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10"
            >
              <Home size={20} />
              Home
            </a>
            <a
              href="/assistants"
              className="text-white hover:text-green-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10"
            >
              <Settings size={20} />
              Assistants
            </a>
            <a
              href="/voice"
              className="text-white hover:text-green-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10"
            >
              <AudioLines size={20} />
              Voice Agent
            </a>
            <a
              href="/chatbot"
              className="text-white hover:text-green-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10"
            >
              <MessageSquare size={20} />
              Chat Agent
            </a>
            
            <a
              href="#admin"
              className="text-white hover:text-green-100 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10"
            >
              <Settings size={20} />
              Admin
            </a>
            
            <button
              onClick={handleAuthClick}
              className="w-full text-white hover:text-green-100 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-3 hover:bg-white/10 border border-white/30 mt-2"
            >
              {isLoggedIn ? (
                <>
                  <LogOut size={20} />
                  Logout
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;