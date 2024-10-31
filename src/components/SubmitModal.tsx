import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjectSubmit } from '../hooks/useSupabase';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface FormData {
  title: string;
  description: string;
  github_url: string;
  bolt_url: string;
  image_url: string;
  tags: string;
}

export default function SubmitModal({ isOpen, onClose, onSubmit }: SubmitModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    github_url: '',
    bolt_url: '',
    image_url: '',
    tags: '',
  });
  const [errors, setErrors] = useState({
    githubUrl: '',
    boltUrl: '',
  });
  const { submitProject, loading } = useProjectSubmit();

  if (!isOpen) return null;

  const validateUrls = () => {
    const newErrors = {
      githubUrl: '',
      boltUrl: '',
    };

    // Validate GitHub URL
    if (!formData.github_url.includes('github.com')) {
      newErrors.githubUrl = 'URL must be from github.com';
    }

    // Validate bolt.new URL
    if (!formData.bolt_url.includes('bolt.new')) {
      newErrors.boltUrl = 'URL must be from bolt.new';
    }

    setErrors(newErrors);
    return !newErrors.githubUrl && !newErrors.boltUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrls()) {
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        image: formData.image_url,
        githubUrl: formData.github_url,
        boltUrl: formData.bolt_url,
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      };

      await submitProject(projectData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        image_url: '',
        github_url: '',
        bolt_url: '',
        tags: '',
      });

      // Call onSubmit to refresh the projects list
      await onSubmit();
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Submit Your Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL of Screenshot
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL of GitHub Repo
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => {
                setFormData({ ...formData, github_url: e.target.value });
                setErrors({ ...errors, githubUrl: '' }); // Clear error on change
              }}
              className={`w-full px-4 py-2 bg-gray-800 rounded-lg border ${
                errors.githubUrl ? 'border-red-500' : 'border-gray-700'
              } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
              required
            />
            {errors.githubUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.githubUrl}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              bolt.new URL
            </label>
            <input
              type="url"
              value={formData.bolt_url}
              onChange={(e) => {
                setFormData({ ...formData, bolt_url: e.target.value });
                setErrors({ ...errors, boltUrl: '' }); // Clear error on change
              }}
              className={`w-full px-4 py-2 bg-gray-800 rounded-lg border ${
                errors.boltUrl ? 'border-red-500' : 'border-gray-700'
              } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
              required
            />
            {errors.boltUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.boltUrl}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="react, typescript, tailwind"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      </div>
    </div>
  );
}