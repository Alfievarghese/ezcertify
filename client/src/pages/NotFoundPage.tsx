import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1c2a4e] flex flex-col justify-between items-center relative overflow-hidden select-none font-sans">
      {/* Central Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 my-auto">
        <h1 className="text-8xl sm:text-9xl font-black text-white tracking-tight mb-4 drop-shadow-md">
          404
        </h1>
        <p className="text-lg sm:text-xl font-normal text-blue-100/90 max-w-md mx-auto mb-8 leading-relaxed">
          Oops! The page you're looking for seems to be lost in the clouds.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3.5 bg-white text-[#1c2a4e] font-semibold text-sm rounded-xl shadow-lg hover:bg-blue-50 active:scale-95 transition-all duration-200"
        >
          Return Home
        </button>
      </div>

      {/* Cloud Illustration Footer (SVG) */}
      <div className="w-full relative shrink-0 leading-none z-0">
        <svg 
          viewBox="0 0 1440 320" 
          className="w-full h-auto block min-h-[160px] object-cover"
          preserveAspectRatio="none"
        >
          {/* Back dark blue cloud layer */}
          <path 
            fill="#2c4d8c" 
            d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,144C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          {/* Mid light blue cloud layer */}
          <path 
            fill="#3b6cb7" 
            d="M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,245.3C672,245,768,203,864,192C960,181,1056,203,1152,213.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          {/* Front white cloud layer */}
          <path 
            fill="#ffffff" 
            d="M0,288L60,272C120,256,240,224,360,229.3C480,235,600,277,720,272C840,267,960,213,1080,213.3C1200,213,1320,267,1380,293.3L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
