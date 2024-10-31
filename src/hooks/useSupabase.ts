import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (session: any) => {
    if (!session?.user) return null;
    
    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username,
      avatarUrl: session.user.user_metadata?.avatar_url,
      isAuthenticated: true,
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(formatUser(session));
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(formatUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return { user, loading, logout };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:author_id(
            username,
            avatar_url
          ),
          project_tags(
            tags(name)
          ),
          likes(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data?.map(project => ({
        ...project,
        tags: project.project_tags?.map((pt: { tags: { name: string } }) => pt.tags.name) || [],
        likes_count: project.likes?.length || 0,
        user_has_liked: userId ? project.likes?.some(like => like.user_id === userId) : false,
      })) || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      // First delete related records in project_tags
      await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', projectId);

      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Refresh the projects list
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, refetch: fetchProjects, deleteProject };
}

export function useProjectSubmit() {
  const submitProject = async (projectData: {
    title: string;
    description: string;
    image: string;
    githubUrl: string;
    tags: string[];
  }) => {
    const session = await supabase.auth.getSession();
    const user = session.data.session?.user;
    if (!user) throw new Error('User not authenticated');

    // First, create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          title: projectData.title,
          description: projectData.description,
          image_url: projectData.image,
          github_url: projectData.githubUrl,
          author_id: user.id,
        },
      ])
      .select()
      .single();

    if (projectError) throw projectError;

    // Then, handle tags
    for (const tagName of projectData.tags) {
      // Try to find existing tag or create new one
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single();

      if (tagError && tagError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw tagError;
      }

      let tagId = tag?.id;

      if (!tagId) {
        const { data: newTag, error: newTagError } = await supabase
          .from('tags')
          .insert([{ name: tagName }])
          .select()
          .single();

        if (newTagError) throw newTagError;
        tagId = newTag.id;
      }

      // Create project-tag relationship
      await supabase
        .from('project_tags')
        .insert([{ project_id: project.id, tag_id: tagId }]);
    }

    return project;
  };

  return { submitProject };
}

export function useLikes() {
  const [loading, setLoading] = useState(false);

  const toggleLike = async (projectId: string) => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (existingLike) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ user_id: user.id, project_id: projectId }]);
          
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading };
}