'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Directly call logout without confirmation
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg">
              {/* Bank verification icon */}
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield base */}
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                {/* Eye in center */}
                <ellipse cx="12" cy="11" rx="3" ry="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="12" cy="11" r="1" fill="currentColor"/>
                {/* Scanning lines */}
                <path d="M8 8L16 8" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                <path d="M8 14L16 14" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
                {/* Corner brackets */}
                <path d="M6 6L6 8L8 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 6L18 8L16 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M6 16L6 14L8 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
                <path d="M18 16L18 14L16 14" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
              </svg>
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                MyBankCheck
              </h1>
              <p className="text-xs text-gray-500 font-medium">Bank Account Risk Checker</p>
            </div>
          </div>
          
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}