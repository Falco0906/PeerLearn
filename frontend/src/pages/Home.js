import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Grid, List, Filter, TrendingUp, Clock, Star, Play } from 'lucide-react';
import VideoCard from '../components/Video/VideoCard';
import Navbar from '../components/Layout/Navbar';
import Chatbot from '../components/Chatbot/Chatbot';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [viewMode, setViewMode] = useState('grid');

    const { data: videosData, isLoading } = useQuery({
        queryKey: ['videos', searchTerm, subjectFilter, topicFilter],
        queryFn: async () => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (subjectFilter) params.subject = subjectFilter;
            if (topicFilter) params.topic = topicFilter;

            try {
                const response = await axios.get(`${API_URL}/api/videos`, { params });
                return response.data;
            } catch (error) {
                console.error('Error fetching videos:', error);
                return { videos: [], pagination: {} };
            }
        }
    });

    const videos = videosData?.videos || [];
    const stats = {
        total: videosData?.pagination?.total || 0,
        trending: videos.filter(v => v.views > 200).length,
        recent: videos.filter(v => new Date(v.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length
    };

    // Sort videos
    const sortedVideos = [...videos].sort((a, b) => {
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'likes') return b.likes - a.likes;
        if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="container mx-auto px-6 py-8">
                {/* Hero Section with Stats */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                                KLH Peer Learning Platform
                            </h1>
                            <p className="text-gray-600 text-lg">Discover, learn, and share knowledge with your peers</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">Total Videos</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                                    <Play className="text-white" size={28} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">Trending Now</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{stats.trending}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                                    <TrendingUp className="text-white" size={28} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">New This Week</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">{stats.recent}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl">
                                    <Clock className="text-white" size={28} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filter Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Filter className="text-white" size={20} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Search & Filter</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                            <input
                                type="text"
                                placeholder="Search by title, topic, or keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                            />
                        </div>
                        
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            >
                                <option value="">All Subjects</option>
                                <option value="Programming">Programming</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Science">Science</option>
                            </select>
                            
                            <select
                                value={topicFilter}
                                onChange={(e) => setTopicFilter(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            >
                                <option value="">All Topics</option>
                                <option value="Data Structures">Data Structures</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Database Management">Database Management</option>
                                <option value="Operating Systems">Operating Systems</option>
                                <option value="Machine Learning">Machine Learning</option>
                            </select>
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            >
                                <option value="createdAt">📅 Newest First</option>
                                <option value="views">👁️ Most Viewed</option>
                                <option value="likes">❤️ Most Liked</option>
                            </select>
                            
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 p-2.5 rounded-lg transition-all font-medium ${
                                        viewMode === 'grid' 
                                            ? 'bg-white shadow-md text-indigo-600' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Grid size={20} className="mx-auto" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 p-2.5 rounded-lg transition-all font-medium ${
                                        viewMode === 'list' 
                                            ? 'bg-white shadow-md text-indigo-600' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <List size={20} className="mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Videos Grid/List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="text-gray-700 text-lg font-semibold">Loading amazing content...</p>
                            <p className="text-gray-500 mt-2">Finding the best videos for you</p>
                        </div>
                    </div>
                ) : sortedVideos.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {searchTerm || subjectFilter || topicFilter ? 'Search Results' : 'All Videos'} 
                                <span className="ml-3 text-sm font-normal text-gray-500">({sortedVideos.length} videos)</span>
                            </h3>
                        </div>
                        
                        <div className={viewMode === 'grid' 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                            : "flex flex-col gap-4"
                        }>
                            {sortedVideos.map(video => (
                                <VideoCard 
                                    key={video._id || video.id} 
                                    video={video} 
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
                            <Search className="text-indigo-600" size={64} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No videos found</h3>
                        <p className="text-gray-600 text-lg mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setSubjectFilter('');
                                setTopicFilter('');
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
                </div>
            </div>
            <Chatbot />
        </>
    );
};

export default Home;