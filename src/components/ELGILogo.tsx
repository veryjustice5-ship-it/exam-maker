import React from 'react';

interface ELGILogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  inverted?: boolean;
}

export const ELGILogo: React.FC<ELGILogoProps> = ({
  className = 'w-10 h-10',
  variant = 'full',
}) => {
  // Always use crisp white / bright styling for the ELGI white logo
  const bookPageColor = '#ffffff';
  const bookShadowColor = '#f1f5f9';
  const bookBorderColor = '#e2e8f0';
  const subTextColor = '#ffffff';

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 320 250"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="elgiFlameIcon" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="elgiInnerFlameIcon" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id="elgiTorchWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <filter id="whiteGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* FLAME */}
        <g id="torch-flame">
          <path
            d="M160 18 C145 45, 120 70, 122 102 C124 125, 142 142, 160 142 C178 142, 196 125, 198 102 C200 70, 175 45, 160 18 Z"
            fill="url(#elgiFlameIcon)"
          />
          <path
            d="M162 20 C182 45, 204 76, 198 104 C194 88, 185 75, 174 65 C168 55, 164 35, 162 20 Z"
            fill="#ea580c"
            opacity="0.9"
          />
          <path
            d="M160 48 C148 70, 138 90, 142 112 C145 128, 155 136, 160 136 C165 136, 175 128, 178 112 C182 90, 172 70, 160 48 Z"
            fill="url(#elgiInnerFlameIcon)"
          />
          <path
            d="M160 82 C154 96, 152 108, 155 120 C157 126, 160 128, 160 128 C160 128, 163 126, 165 120 C168 108, 166 96, 160 82 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>

        {/* TORCH STAND - WHITE / SILVER */}
        <g id="torch-stand">
          <path d="M126 142 L194 142 L182 172 L138 172 Z" fill="url(#elgiTorchWhite)" stroke="#f8fafc" strokeWidth="1" />
          <ellipse cx="160" cy="142" rx="34" ry="4" fill="#fbbf24" />
          <ellipse cx="160" cy="172" rx="22" ry="3" fill="#cbd5e1" />
          <path d="M148 172 L172 172 L168 206 L152 206 Z" fill="url(#elgiTorchWhite)" />
          <line x1="148" y1="184" x2="172" y2="184" stroke="#f97316" strokeWidth="2" />
          <line x1="150" y1="196" x2="170" y2="196" stroke="#f97316" strokeWidth="2" />
          <path d="M148 196 C135 196, 124 205, 122 216 L128 217 C130 208, 138 202, 148 202 Z" fill="#ffffff" />
          <path d="M172 196 C185 196, 196 205, 198 216 L192 217 C190 208, 182 202, 172 202 Z" fill="#ffffff" />
        </g>

        {/* OPEN BOOK - CRISP WHITE */}
        <g id="open-book">
          <circle cx="160" cy="222" r="16" fill={bookPageColor} filter="url(#whiteGlowFilter)" />
          <circle cx="160" cy="222" r="9" fill={bookShadowColor} stroke={bookBorderColor} strokeWidth="1" />
          <path d="M160 215 C125 210, 65 204, 28 206 L34 216 C70 214, 126 219, 156 226 Z" fill={bookPageColor} />
          <path d="M38 218 C72 216, 124 221, 154 227 L152 232 C120 226, 68 221, 35 224 Z" fill={bookShadowColor} />
          <path d="M34 216 L18 227 C60 224, 120 231, 154 242 L158 233 C124 224, 62 217, 34 216 Z" fill={bookPageColor} stroke={bookBorderColor} strokeWidth="1" />
          <path d="M160 215 C195 210, 255 204, 292 206 L286 216 C250 214, 194 219, 164 226 Z" fill={bookPageColor} />
          <path d="M282 218 C248 216, 196 221, 166 227 L168 232 C200 226, 252 221, 285 224 Z" fill={bookShadowColor} />
          <path d="M286 216 L302 227 C260 224, 200 231, 166 242 L162 233 C196 224, 258 217, 286 216 Z" fill={bookPageColor} stroke={bookBorderColor} strokeWidth="1" />
        </g>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon portion */}
      <svg
        viewBox="0 0 320 250"
        className="w-10 h-10 shrink-0 drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="elgiFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="elgiInnerFlame" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id="elgiTorchWhiteFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* FLAME */}
        <g id="torch-flame">
          <path
            d="M160 18 C145 45, 120 70, 122 102 C124 125, 142 142, 160 142 C178 142, 196 125, 198 102 C200 70, 175 45, 160 18 Z"
            fill="url(#elgiFlame)"
          />
          <path
            d="M162 20 C182 45, 204 76, 198 104 C194 88, 185 75, 174 65 C168 55, 164 35, 162 20 Z"
            fill="#ea580c"
            opacity="0.9"
          />
          <path
            d="M160 48 C148 70, 138 90, 142 112 C145 128, 155 136, 160 136 C165 136, 175 128, 178 112 C182 90, 172 70, 160 48 Z"
            fill="url(#elgiInnerFlame)"
          />
          <path
            d="M160 82 C154 96, 152 108, 155 120 C157 126, 160 128, 160 128 C160 128, 163 126, 165 120 C168 108, 166 96, 160 82 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>

        {/* TORCH STAND - WHITE / SILVER */}
        <g id="torch-stand">
          <path d="M126 142 L194 142 L182 172 L138 172 Z" fill="url(#elgiTorchWhiteFull)" stroke="#f8fafc" strokeWidth="1" />
          <ellipse cx="160" cy="142" rx="34" ry="4" fill="#fbbf24" />
          <ellipse cx="160" cy="172" rx="22" ry="3" fill="#cbd5e1" />
          <path d="M148 172 L172 172 L168 206 L152 206 Z" fill="url(#elgiTorchWhiteFull)" />
          <line x1="148" y1="184" x2="172" y2="184" stroke="#f97316" strokeWidth="2" />
          <line x1="150" y1="196" x2="170" y2="196" stroke="#f97316" strokeWidth="2" />
          <path d="M148 196 C135 196, 124 205, 122 216 L128 217 C130 208, 138 202, 148 202 Z" fill="#ffffff" />
          <path d="M172 196 C185 196, 196 205, 198 216 L192 217 C190 208, 182 202, 172 202 Z" fill="#ffffff" />
        </g>

        {/* OPEN BOOK - CRISP WHITE */}
        <g id="open-book">
          <circle cx="160" cy="222" r="16" fill={bookPageColor} />
          <circle cx="160" cy="222" r="9" fill={bookShadowColor} stroke={bookBorderColor} strokeWidth="1" />
          <path d="M160 215 C125 210, 65 204, 28 206 L34 216 C70 214, 126 219, 156 226 Z" fill={bookPageColor} />
          <path d="M38 218 C72 216, 124 221, 154 227 L152 232 C120 226, 68 221, 35 224 Z" fill={bookShadowColor} />
          <path d="M34 216 L18 227 C60 224, 120 231, 154 242 L158 233 C124 224, 62 217, 34 216 Z" fill={bookPageColor} stroke={bookBorderColor} strokeWidth="1" />
          <path d="M160 215 C195 210, 255 204, 292 206 L286 216 C250 214, 194 219, 164 226 Z" fill={bookPageColor} />
          <path d="M282 218 C248 216, 196 221, 166 227 L168 232 C200 226, 252 221, 285 224 Z" fill={bookShadowColor} />
          <path d="M286 216 L302 227 C260 224, 200 231, 166 242 L162 233 C196 224, 258 217, 286 216 Z" fill={bookPageColor} stroke={bookBorderColor} strokeWidth="1" />
        </g>
      </svg>

      {/* Brand text: Clean white and orange palette */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-white font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            e-Learning
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-300 border border-orange-400/40 font-mono">
            PORTAL
          </span>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-wider mt-0.5 text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          style={{ color: subTextColor }}
        >
          GROUP INSTITUTE
        </span>
      </div>
    </div>
  );
};
