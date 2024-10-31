import React, { useState } from 'react';
import { ExternalLink, Github, Heart, Trash2, Edit2 } from 'lucide-react';
import { Project } from '../types';
import { useLikes } from '../hooks/useSupabase';
import { useProjects } from '../hooks/useSupabase';

interface ProjectCardProps {
  project: Project;
  currentUserId?: string;
  onDelete?: (projectId: string) => Promise<void>;
  onEdit?: (project: Project) => void;
}

export default function ProjectCard({ project, currentUserId, onDelete, onEdit }: ProjectCardProps) {
  const { toggleLike, loading: likeLoading } = useLikes();
  const { refetch } = useProjects();
  const [optimisticLiked, setOptimisticLiked] = useState(project.user_has_liked);
  const [optimisticCount, setOptimisticCount] = useState(project.likes_count);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUserId) return; // Don't allow liking if not logged in
    
    // Optimistic update
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount(optimisticLiked ? optimisticCount - 1 : optimisticCount + 1);
    
    const success = await toggleLike(project.id);
    if (success) {
      await refetch();
    } else {
      // Revert optimistic update if failed
      setOptimisticLiked(project.user_has_liked);
      setOptimisticCount(project.likes_count);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onDelete || !isOwner) return;
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await onDelete(project.id);
    }
  };

  const isOwner = currentUserId === project.author_id;

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
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike}
              disabled={likeLoading || !currentUserId}
              className="flex items-center space-x-1 text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"
              title={currentUserId ? 'Like this project' : 'Login to like projects'}
            >
              <Heart 
                size={20} 
                className={`transition-colors ${
                  optimisticLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
              <span className={`text-sm ${
                optimisticLiked ? 'text-pink-500' : 'text-gray-400'
              }`}>
                {optimisticCount}
              </span>
            </button>
            {isOwner && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.(project);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit project"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
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
            {project.bolt_url && (
              <a
                href={project.bolt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}