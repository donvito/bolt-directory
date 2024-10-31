export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string;
          github_url: string;
          author_id: string;
          featured: boolean;
          likes_count: number;
          created_at: string;
          updated_at: string;
          bolt_url: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url: string;
          github_url: string;
          author_id: string;
          featured?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
          bolt_url?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string;
          github_url?: string;
          author_id?: string;
          featured?: boolean;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
          bolt_url?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      project_tags: {
        Row: {
          project_id: string;
          tag_id: string;
        };
        Insert: {
          project_id: string;
          tag_id: string;
        };
        Update: {
          project_id?: string;
          tag_id?: string;
        };
      };
      likes: {
        Row: {
          user_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          project_id?: string;
          created_at?: string;
        };
      };
    };
  };
}