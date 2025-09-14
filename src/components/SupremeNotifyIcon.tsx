import React from 'react';

interface SupremeNotifyIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SupremeNotifyIcon: React.FC<SupremeNotifyIconProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-12 h-12',
          icon: 'w-6 h-6',
          bell: 'w-4 h-4',
          details: 'w-0.5 h-0.5',
          line: 'w-3 h-0.5',
          clapper: 'w-1 h-1.5',
          handle: 'w-1 h-1',
          waves: 'w-1.5 h-1.5'
        };
      case 'md':
        return {
          container: 'w-16 h-16',
          icon: 'w-10 h-10',
          bell: 'w-6 h-6',
          details: 'w-1 h-1',
          line: 'w-4 h-0.5',
          clapper: 'w-1.5 h-2',
          handle: 'w-1.5 h-1.5',
          waves: 'w-2 h-2'
        };
      case 'lg':
        return {
          container: 'w-20 h-20',
          icon: 'w-14 h-14',
          bell: 'w-10 h-10',
          details: 'w-1.5 h-1.5',
          line: 'w-6 h-0.5',
          clapper: 'w-1.5 h-3',
          handle: 'w-2 h-2',
          waves: 'w-3 h-3'
        };
      case 'xl':
        return {
          container: 'w-24 h-24',
          icon: 'w-16 h-16',
          bell: 'w-12 h-12',
          details: 'w-2 h-2',
          line: 'w-8 h-0.5',
          clapper: 'w-2 h-4',
          handle: 'w-2.5 h-2.5',
          waves: 'w-4 h-4'
        };
      default:
        return {
          container: 'w-16 h-16',
          icon: 'w-10 h-10',
          bell: 'w-6 h-6',
          details: 'w-1 h-1',
          line: 'w-4 h-0.5',
          clapper: 'w-1.5 h-2',
          handle: 'w-1.5 h-1.5',
          waves: 'w-2 h-2'
        };
    }
  };

  const sizes = getSizeClasses();

  return (
    <div className={`inline-flex items-center justify-center ${sizes.container} bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden relative ${className}`}>
      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
      
      {/* Logo de alta qualidade */}
      <div className={`relative ${sizes.icon}`}>
        {/* Sino principal */}
        <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${sizes.bell}`}>
          {/* Corpo do sino com gradiente premium */}
          <div className="w-full h-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-lg relative overflow-hidden">
            {/* Brilho interno */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
            
            {/* Detalhes do sino */}
            <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 ${sizes.details} bg-amber-700 rounded-full shadow-sm`}></div>
            <div className={`absolute top-2.5 left-1/2 transform -translate-x-1/2 ${sizes.details} bg-amber-800 rounded-full`}></div>
            <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${sizes.details} bg-amber-800 rounded-full`}></div>
            <div className={`absolute top-5.5 left-1/2 transform -translate-x-1/2 ${sizes.details} bg-amber-800 rounded-full`}></div>
            
            {/* Linha decorativa */}
            <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 ${sizes.line} bg-amber-700/50 rounded-full`}></div>
          </div>
          
          {/* Badalo do sino */}
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${sizes.clapper} bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-md`}></div>
          
          {/* Alça do sino */}
          <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 ${sizes.handle} bg-gradient-to-b from-amber-500 to-amber-700 rounded-full`}></div>
        </div>
        
        {/* Ondas sonoras premium */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
          <div className={`${sizes.waves} border-2 border-white/80 rounded-full animate-ping`}></div>
          <div className={`absolute top-0 left-0 ${sizes.waves} border-2 border-white/60 rounded-full animate-ping`} style={{animationDelay: '0.3s'}}></div>
          <div className={`absolute top-0 left-0 ${sizes.waves} border-2 border-white/40 rounded-full animate-ping`} style={{animationDelay: '0.6s'}}></div>
          <div className={`absolute top-0 left-0 ${sizes.waves} border-2 border-white/20 rounded-full animate-ping`} style={{animationDelay: '0.9s'}}></div>
        </div>
        
        {/* Partículas de som */}
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute top-3 right-0 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-5 right-1 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Efeito de partículas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 left-2 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
        <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white/15 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-white/10 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
      </div>
    </div>
  );
};

export default SupremeNotifyIcon;
