import React from 'react';

interface ELGILogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  inverted?: boolean;
}

export const ELGILogo: React.FC<ELGILogoProps> = ({
  className = 'w-10 h-10',
  variant = 'full',
  inverted = false,
}) => {
  const textColor = inverted ? '#f8fafc' : '#0f172a';
  const subTextColor = inverted ? '#cbd5e1' : '#1e293b';

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
          <linearGradient id="elgiTorchIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
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
            opacity="0.85"
          />
        </g>

        {/* TORCH STAND */}
        <g id="torch-stand">
          <path d="M126 142 L194 142 L182 172 L138 172 Z" fill="url(#elgiTorchIcon)" />
          <ellipse cx="160" cy="142" rx="34" ry="4" fill="#c2410c" />
          <ellipse cx="160" cy="172" rx="22" ry="3" fill="#451a03" />
          <path d="M148 172 L172 172 L168 206 L152 206 Z" fill="url(#elgiTorchIcon)" />
          <line x1="148" y1="184" x2="172" y2="184" stroke="#c2410c" strokeWidth="2" />
          <line x1="150" y1="196" x2="170" y2="196" stroke="#c2410c" strokeWidth="2" />
          <path d="M148 196 C135 196, 124 205, 122 216 L128 217 C130 208, 138 202, 148 202 Z" fill="url(#elgiTorchIcon)" />
          <path d="M172 196 C185 196, 196 205, 198 216 L192 217 C190 208, 182 202, 172 202 Z" fill="url(#elgiTorchIcon)" />
        </g>

        {/* OPEN BOOK */}
        <g id="open-book">
          <circle cx="160" cy="222" r="16" fill={inverted ? '#334155' : '#1e293b'} />
          <circle cx="160" cy="222" r="9" fill={inverted ? '#0f172a' : '#0f172a'} />
          <path d="M160 215 C125 210, 65 204, 28 206 L34 216 C70 214, 126 219, 156 226 Z" fill={inverted ? '#cbd5e1' : '#1e293b'} />
          <path d="M38 218 C72 216, 124 221, 154 227 L152 232 C120 226, 68 221, 35 224 Z" fill={inverted ? '#94a3b8' : '#334155'} />
          <path d="M34 216 L18 227 C60 224, 120 231, 154 242 L158 233 C124 224, 62 217, 34 216 Z" fill={inverted ? '#f1f5f9' : '#0f172a'} />
          <path d="M160 215 C195 210, 255 204, 292 206 L286 216 C250 214, 194 219, 164 226 Z" fill={inverted ? '#cbd5e1' : '#1e293b'} />
          <path d="M282 218 C248 216, 196 221, 166 227 L168 232 C200 226, 252 221, 285 224 Z" fill={inverted ? '#94a3b8' : '#334155'} />
          <path d="M286 216 L302 227 C260 224, 200 231, 166 242 L162 233 C196 224, 258 217, 286 216 Z" fill={inverted ? '#f1f5f9' : '#0f172a'} />
        </g>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon portion */}
      <svg
        viewBox="0 0 320 250"
        className="w-10 h-10 shrink-0"
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
          <linearGradient id="elgiTorch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

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
            opacity="0.85"
          />
        </g>

        <g id="torch-stand">
          <path d="M126 142 L194 142 L182 172 L138 172 Z" fill="url(#elgiTorch)" />
          <ellipse cx="160" cy="142" rx="34" ry="4" fill="#c2410c" />
          <ellipse cx="160" cy="172" rx="22" ry="3" fill="#451a03" />
          <path d="M148 172 L172 172 L168 206 L152 206 Z" fill="url(#elgiTorch)" />
          <line x1="148" y1="184" x2="172" y2="184" stroke="#c2410c" strokeWidth="2" />
          <line x1="150" y1="196" x2="170" y2="196" stroke="#c2410c" strokeWidth="2" />
          <path d="M148 196 C135 196, 124 205, 122 216 L128 217 C130 208, 138 202, 148 202 Z" fill="url(#elgiTorch)" />
          <path d="M172 196 C185 196, 196 205, 198 216 L192 217 C190 208, 182 202, 172 202 Z" fill="url(#elgiTorch)" />
        </g>

        <g id="open-book">
          <circle cx="160" cy="222" r="16" fill={inverted ? '#334155' : '#1e293b'} />
          <circle cx="160" cy="222" r="9" fill={inverted ? '#0f172a' : '#0f172a'} />
          <path d="M160 215 C125 210, 65 204, 28 206 L34 216 C70 214, 126 219, 156 226 Z" fill={inverted ? '#cbd5e1' : '#1e293b'} />
          <path d="M38 218 C72 216, 124 221, 154 227 L152 232 C120 226, 68 221, 35 224 Z" fill={inverted ? '#94a3b8' : '#334155'} />
          <path d="M34 216 L18 227 C60 224, 120 231, 154 242 L158 233 C124 224, 62 217, 34 216 Z" fill={inverted ? '#f1f5f9' : '#0f172a'} />
          <path d="M160 215 C195 210, 255 204, 292 206 L286 216 C250 214, 194 219, 164 226 Z" fill={inverted ? '#cbd5e1' : '#1e293b'} />
          <path d="M282 218 C248 216, 196 221, 166 227 L168 232 C200 226, 252 221, 285 224 Z" fill={inverted ? '#94a3b8' : '#334155'} />
          <path d="M286 216 L302 227 C260 224, 200 231, 166 242 L162 233 C196 224, 258 217, 286 216 Z" fill={inverted ? '#f1f5f9' : '#0f172a'} />
        </g>
      </svg>

      {/* Brand text matching the logo typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-orange-500 font-sans">
            e-Learning
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
            PORTAL
          </span>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-wider mt-0.5"
          style={{ color: subTextColor }}
        >
          GROUP INSTITUTE
        </span>
      </div>
    </div>
  );
};
