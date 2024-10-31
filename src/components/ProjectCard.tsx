import React from 'react';
import { ExternalLink, Github, Heart } from 'lucide-react';
import { Project } from '../types';
import { useLikes } from '../hooks/useSupabase';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { toggleLike, loading } = useLikes();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleLike(project.id);
  };

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <button 
            onClick={handleLike}
            disabled={loading}
            className={`text-gray-400 hover:text-pink-500 transition-colors ${loading ? 'opacity-50' : ''}`}
          >
            <Heart size={20} className={project.liked ? 'fill-pink-500 text-pink-500' : ''} />
          </button>
        </div>
        <p className="mt-2 text-gray-400 text-sm">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={project.profiles?.avatar_url || `https://github.com/${project.profiles?.username}.png`}
              alt={project.profiles?.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-400">{project.profiles?.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}