import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import SubmitModal from './components/SubmitModal';
import { useAuth, useProjects } from './hooks/useSupabase';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, refetch } = useProjects();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Handle initial load state
  useEffect(() => {
    if (!authLoading && !projectsLoading) {
      setInitialLoadComplete(true);
    }
  }, [authLoading, projectsLoading]);

  const handleGitHubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        console.error('Login error:', error.message);
      }
    } catch (error) {
      console.error('Failed to initiate login:', error);
    }
  };

  const handleProjectSubmit = async (data: {
    title: string;
    description: string;
    image: string;
    githubUrl: string;
    tags: string[];
  }) => {
    if (!user?.id) {
      console.error('User not logged in');
      return;
    }

    try {
      const { error } = await supabase.from('projects').insert([{
        title: data.title,
        description: data.description,
        image_url: data.image,
        github_url: data.githubUrl,
        author_id: user.id,
      }]);

      if (error) throw error;
      
      await refetch();
      setIsSubmitModalOpen(false);
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only show loading state on initial load
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header
        user={user}
        onLogin={handleGitHubLogin}
        onSubmit={() => setIsSubmitModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              bolt.new Generations
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Explore and share incredible projects built with bolt.dev. Join our community
            of creators and showcase your work to the world.
          </p>
          
          <div className="relative mt-8 w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-xl border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
}

export default App;