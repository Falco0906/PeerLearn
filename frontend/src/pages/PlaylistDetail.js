import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { List, Play, Clock, Eye, ThumbsUp, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';
import VideoCard from '../components/Video/VideoCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/playlists/${id}`);
        setPlaylist(response.data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </>
    );
  }

  if (!playlist) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Playlist not found</h2>
          <Link to="/playlists" className="text-indigo-600 hover:underline mt-4 inline-block">
            ← Back to Playlists
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <Link 
            to="/playlists" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Playlists</span>
          </Link>

          {/* Playlist Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              {/* Playlist Icon */}
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <List size={64} className="text-white opacity-90" />
              </div>

              {/* Playlist Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {playlist.subject}
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {playlist.topic}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {playlist.title || playlist.name}
                </h1>

                <p className="text-gray-600 text-lg mb-4">
                  {playlist.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Play size={18} />
                    <span>{playlist.videos?.length || 0} videos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye size={18} />
                    <span>{playlist.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={18} />
                    <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {playlist.creator && (
                  <div className="flex items-center space-x-3 mt-4 pt-4 border-t">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {playlist.creator.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{playlist.creator.name}</p>
                      <p className="text-xs text-gray-500">{playlist.creator.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Videos in Playlist */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Play className="text-indigo-600" size={28} />
              <span>Videos in this Playlist</span>
            </h2>

            {playlist.videos && playlist.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {playlist.videos.map((video, index) => (
                  <div key={video._id || index} className="relative">
                    {/* Video Number Badge */}
                    <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                    <VideoCard video={video} viewMode="grid" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
                  <Play className="text-indigo-600" size={64} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No videos in this playlist yet</h3>
                <p className="text-gray-600 text-lg mb-6">Videos will appear here when they are added to the playlist.</p>
                <Link 
                  to="/" 
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold inline-block"
                >
                  Browse All Videos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaylistDetail;
