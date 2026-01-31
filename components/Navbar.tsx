import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-2 sm:px-4">
      <div className="container mx-auto h-16 sm:h-20 flex items-center justify-between max-w-6xl">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-black text-xl sm:text-2xl">ج</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-none">جسر الشفاء</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold hidden sm:block">رعايتكم، شغفنا</span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
            <p className="text-[10px] text-blue-500 font-bold leading-none mt-1 uppercase tracking-tighter">
              {user.role === 'DOCTOR' ? 'طبيب متخصص' : 'مريض'}
            </p>
          </div>
          
          <div className="relative group">
            <img 
              src={user.avatar} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-slate-100 shadow-sm group-hover:border-blue-300 transition-colors" 
              alt="Avatar" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <button 
            onClick={onLogout} 
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
            title="تسجيل الخروج"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
