import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, PlaySquare, Upload, User, LogIn, LogOut, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Video className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              KLH Peer Learning
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/' 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PlaySquare size={20} />
              <span>Videos</span>
            </Link>
            
            <Link 
              to="/playlists" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/playlists' 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List size={20} />
              <span>Playlists</span>
            </Link>
            
            <Link 
              to="/upload" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/upload' 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Upload size={20} />
              <span>Upload</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    location.pathname === '/profile' 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                
                <div className="flex items-center space-x-3 pl-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.universityId}</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg flex items-center space-x-2 transition-all ml-2"
              >
                <LogIn size={18} />
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
