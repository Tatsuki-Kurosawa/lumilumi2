import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, User } from 'lucide-react';

interface Work {
  id: string;
  title: string;
  thumbnail: string;
  authorDisplayName: string; // 表示用
  authorUsername: string;   // リンク用
  likes: number;
  views: number;
  tags: string[];
}

interface WorkCardProps {
  work: Work;
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <Link to={`/works/${work.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={work.thumbnail}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/works/${work.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {work.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <User className="h-4 w-4 mr-1" />
          <Link to={`/user/${encodeURIComponent(work.authorUsername)}`} className="hover:text-blue-600 transition-colors">
            {work.authorDisplayName}
          </Link>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              <span>{work.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{work.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {work.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
          {work.tags.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs text-gray-400">
              +{work.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;