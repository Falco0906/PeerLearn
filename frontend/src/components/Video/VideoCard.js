import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, ThumbsUp } from 'lucide-react';

const VideoCard = ({ video, viewMode = 'grid' }) => {
  if (!video) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/video/${video._id || video.id}`} className="block group">
        <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-4 border border-gray-100">
          <div className="flex space-x-4">
            <div className="relative flex-shrink-0">
              <img 
                src={video.thumbnailUrl || `https://picsum.photos/seed/${video._id || 'default'}/384/216`}
                alt={video.title}
                className="w-64 h-36 object-cover rounded-xl"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${video._id || 'fallback'}/384/216`;
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-90 text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
                {formatDuration(video.duration)}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                <div className="bg-white/90 p-3 rounded-full">
                  <Play className="w-8 h-8 text-indigo-600" fill="currentColor" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {video.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)} views</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{formatNumber(video.likes)} likes</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {video.uploader?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">{video.uploader?.name || 'Unknown User'}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                      {video.subject}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {video.topic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/video/${video._id || video.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={video.thumbnailUrl || `https://picsum.photos/seed/${video._id || 'default'}/640/360`}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${video._id || 'fallback'}/640/360`;
            }}
          />
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-90 text-white px-2.5 py-1 rounded-lg text-sm font-semibold backdrop-blur-sm">
            {formatDuration(video.duration)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
            <div className="bg-white/95 p-4 rounded-full transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-10 h-10 text-indigo-600" fill="currentColor" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-lg">
            {video.title}
          </h3>
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {video.uploader?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700">{video.uploader?.name || 'Unknown User'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{formatNumber(video.views)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ThumbsUp className="w-4 h-4" />
              <span className="font-medium">{formatNumber(video.likes)}</span>
            </span>
            <span className="text-xs">{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
              {video.subject}
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold">
              {video.topic}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
