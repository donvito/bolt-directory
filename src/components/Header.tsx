import React from 'react';
import { Github, Plus } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onSubmit: () => void;
}

export default function Header({ user, onLogin, onSubmit }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-lg border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              bolt.new directory
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSubmit}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              <span>Submit Project</span>
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-300">{user.username}</span>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <Github size={18} />
                <span>Login with GitHub</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}