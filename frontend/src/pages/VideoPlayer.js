import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, Eye, MessageCircle, HelpCircle, Share2 } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Layout/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const VideoPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [activeTab, setActiveTab] = useState('comments');

  const fetchVideo = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/videos/${id}`);
      setVideo(response.data);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like videos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/videos/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchVideo();
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/comments`,
        { text: commentText, videoId: id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommentText('');
      fetchVideo();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to ask questions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/qa`,
        { question: questionText, videoId: id },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setQuestionText('');
      fetchVideo();
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Video not found</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Video Player */}
      <div className="bg-black aspect-video rounded-lg overflow-hidden mb-6">
        <video
          controls
          className="w-full h-full"
          src={`${API_URL}${video.videoUrl}`}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h1>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{video.views} views</span>
            </span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{video.likes}</span>
            </button>
            <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {video.uploader?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{video.uploader?.name}</h3>
            <p className="text-sm text-gray-600">{video.uploader?.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-700">{video.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {video.subject}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {video.topic}
            </span>
            {video.tags?.map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-4 px-6 font-medium ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="inline w-5 h-5 mr-2" />
            Comments ({video.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex-1 py-4 px-6 font-medium ${
              activeTab === 'qa'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="inline w-5 h-5 mr-2" />
            Q&A ({video.qaSection?.length || 0})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'comments' ? (
            <div>
              {/* Add Comment */}
              {user && (
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {video.comments?.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                      {comment.author?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm">{comment.author?.name}</p>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <button className="hover:text-blue-600">Like ({comment.likes})</button>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Ask Question */}
              {user && (
                <form onSubmit={handleAskQuestion} className="mb-6">
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ask Question
                  </button>
                </form>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {video.qaSection?.map((qa) => (
                  <div key={qa._id} className="border-b pb-6">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center text-purple-700 font-bold">
                        {qa.askedBy?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{qa.askedBy?.name}</p>
                        <p className="text-gray-700 mt-1">{qa.question}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{qa.answers?.length || 0} answers</span>
                          <span>{new Date(qa.createdAt).toLocaleDateString()}</span>
                          {qa.isResolved && (
                            <span className="text-green-600 font-medium">✓ Resolved</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default VideoPlayer;
