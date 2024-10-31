import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateUser(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        await updateUser(session);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    async function updateUser(session: any) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser({
        username: profile?.username || session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || '',
        avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url || `https://github.com/${profile?.username}.png`,
        isAuthenticated: true,
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_author_id_fkey(username, avatar_url),
          project_tags(
            tags(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data?.map(project => ({
        ...project,
        tags: project.project_tags?.map(pt => pt.tags.name) || []
      })) || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, refetch: fetchProjects };
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
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user;
      if (!user) throw new Error('User not authenticated');

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
      } else {
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, project_id: projectId }]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return { toggleLike, loading };
}