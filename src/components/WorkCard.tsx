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
    <div className="bg-bg-base rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group">
      <Link to={`/works/${work.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={work.thumbnail}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
        </div>
      </Link>
      
      <div className="p-5">
        <Link to={`/works/${work.id}`}>
          <h3 className="font-semibold text-text-primary mb-3 line-clamp-2 hover:text-primary-500 transition-colors text-base leading-snug">
            {work.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-sm text-text-secondary mb-4">
          <User className="h-4 w-4 mr-1.5 text-text-tertiary" />
          <Link to={`/user/${encodeURIComponent(work.authorUsername)}`} className="hover:text-primary-500 transition-colors font-medium">
            {work.authorDisplayName}
          </Link>
        </div>
        
        <div className="flex items-center justify-between text-sm text-text-tertiary mb-4">
          <div className="flex items-center space-x-5">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1.5" />
              <span className="font-medium">{work.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1.5" />
              <span className="font-medium">{work.views.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {work.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-3 py-1 text-xs bg-bg-secondary text-text-secondary rounded-full hover:bg-primary-50 hover:text-primary-500 cursor-pointer transition-all font-medium"
            >
              #{tag}
            </span>
          ))}
          {work.tags.length > 3 && (
            <span className="inline-block px-3 py-1 text-xs text-text-tertiary font-medium">
              +{work.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;