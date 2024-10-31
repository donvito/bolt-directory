import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import SubmitModal from './components/SubmitModal';
import EditModal from './components/EditModal';
import { useAuth, useProjects } from './hooks/useSupabase';
import { supabase } from './lib/supabase';
import { Project } from './types';

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { projects, loading: projectsLoading, refetch, deleteProject } = useProjects();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Only show loading state when auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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

  const handleProjectSubmit = async () => {
    try {
      await refetch();
      setIsSubmitModalOpen(false);
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleProjectUpdate = async (projectData: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject?.id)
        .select()
        .single();

      if (error) throw error;
      await refetch();
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userProjects = filteredProjects.filter((project) => project.author_id === user?.id);
  const otherProjects = filteredProjects.filter((project) => project.author_id !== user?.id);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header
        user={user}
        onLogin={handleGitHubLogin}
        onLogout={handleLogout}
        onSubmit={user ? () => setIsSubmitModalOpen(true) : undefined}
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

        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {user && userProjects.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Your Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      currentUserId={user?.id}
                      onDelete={handleDeleteProject}
                      onEdit={setEditingProject}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6">
                {user ? 'Community Projects' : 'All Projects'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    currentUserId={user?.id}
                    onDelete={handleDeleteProject}
                    onEdit={setEditingProject}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {user && (
        <SubmitModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleProjectSubmit}
        />
      )}

      {editingProject && (
        <EditModal
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleProjectUpdate}
        />
      )}
    </div>
  );
}

export default App;