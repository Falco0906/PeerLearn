import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { List, Play, Plus, Clock, Video } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    subject: 'Mathematics'
  });

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/playlists`);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/playlists`,
        newPlaylist,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', subject: 'Mathematics' });
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Playlists
              </h1>
              <p className="text-gray-600">Organized collections of educational content</p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
              >
                <Plus size={20} />
                <span>Create Playlist</span>
              </button>
            )}
          </div>

          {/* Playlists Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map(playlist => (
                <Link
                  key={playlist._id}
                  to={`/playlist/${playlist._id}`}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100 group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 text-white text-center">
                      <List size={48} className="mx-auto mb-2 opacity-90" />
                      <p className="text-lg font-semibold">{playlist.videos?.length || 0} Videos</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {playlist.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                        {playlist.subject}
                      </span>
                      <span className="text-gray-500 flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
                <List className="text-indigo-600" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No playlists yet</h3>
              <p className="text-gray-600 text-lg mb-6">Create your first playlist to organize your learning content</p>
              {user && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Create Playlist
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Playlist</h2>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Data Structures Basics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Describe what this playlist is about..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={newPlaylist.subject}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Programming">Programming</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Playlists;
