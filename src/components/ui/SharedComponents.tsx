import React from 'react';
import { motion } from 'motion';

/**
 * The Evidence OS - Shared UI Primitives
 * Editorial hierarchy, restrained typography, precision borders, controlled elevations.
 */

// Display headings with Space Grotesk
export const DisplayHeading: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}> = ({ children, size = '2xl', className = '' }) => {
  const sizes = {
    sm: 'text-xl md:text-2xl tracking-tight',
    md: 'text-2xl md:text-3xl tracking-tight',
    lg: 'text-3xl md:text-4xl tracking-tight',
    xl: 'text-4xl md:text-5xl tracking-tight leading-[1.08]',
    '2xl': 'text-5xl md:text-6xl tracking-tight leading-[1.05]',
    '3xl': 'text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.98]',
  };

  return (
    <h1 className={`font-display font-semibold text-[#F8FAFC] ${sizes[size]} ${className}`}>
      {children}
    </h1>
  );
};

// Section headings
export const SectionHeading: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <h2 className={`font-display font-semibold text-lg md:text-xl text-[#F8FAFC] tracking-tight ${className}`}>
      {children}
    </h2>
  );
};

// Restrained uppercase label text
export const Label: React.FC<{
  children: React.ReactNode;
  color?: 'violet' | 'cyan' | 'success' | 'warning' | 'danger' | 'neutral' | 'muted';
  className?: string;
}> = ({ children, color = 'neutral', className = '' }) => {
  const colors = {
    violet: 'text-[#8B7CFF]',
    cyan: 'text-[#62DCEB]',
    success: 'text-[#29D6A0]',
    warning: 'text-[#F2BB5B]',
    danger: 'text-[#F16D7A]',
    neutral: 'text-[#94A3B8]',
    muted: 'text-[#64748B]',
  };

  return (
    <span className={`text-label ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

// Precision button component
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: (e?: any) => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  className = '',
  icon,
  type = 'button',
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded select-none cursor-pointer disabled:cursor-not-allowed';
  
  const variants = {
    primary:
      'bg-[#8B7CFF] text-[#080A10] font-semibold hover:bg-[#9D90FF] active:bg-[#7866FF] shadow-[0_0_20px_rgba(139,124,255,0.25)] border border-[#8B7CFF]/50',
    secondary:
      'bg-[#121824] text-[#F8FAFC] border border-[rgba(148,163,184,0.14)] hover:bg-[#192232] hover:border-[rgba(148,163,184,0.25)] active:bg-[#0D111B]',
    outline:
      'bg-transparent text-[#94A3B8] border border-[rgba(148,163,184,0.18)] hover:text-white hover:border-[rgba(148,163,184,0.35)] hover:bg-[#121824]/60',
    ghost:
      'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#121824]/60',
    danger:
      'bg-[#F16D7A]/15 text-[#F16D7A] border border-[#F16D7A]/30 hover:bg-[#F16D7A]/25',
  };

  const sizes = {
    xs: 'px-2 py-1 text-[11px] h-7',
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-4 py-2 text-xs font-medium h-9',
    lg: 'px-5 py-2.5 text-sm h-11',
  };

  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { y: 0 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

// Surface panel component
export const Surface: React.FC<{
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', elevated = false, hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${
        elevated ? 'bg-[#192232]' : 'bg-[#121824]'
      } border border-[rgba(148,163,184,0.1)] rounded-lg transition-all duration-200 ${
        hover
          ? 'hover:border-[rgba(139,124,255,0.35)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Status badge with minimal dot
export const StatusBadge: React.FC<{
  status:
    | 'VERIFIED'
    | 'NEEDS_REVIEW'
    | 'AWAITING_EVIDENCE'
    | 'INCOMPLETE'
    | 'ACTIVE'
    | 'PENDING'
    | 'COMPLETED'
    | 'FAILED'
    | 'PASSED'
    | 'UNCERTAIN'
    | 'INSUFFICIENT_EVIDENCE'
    | string;
  className?: string;
  showDot?: boolean;
}> = ({ status, className = '', showDot = true }) => {
  const normalized = status.toUpperCase();
  
  const config: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
    VERIFIED: { color: 'text-[#29D6A0]', bg: 'bg-[#29D6A0]/8', border: 'border-[#29D6A0]/25', dot: 'bg-[#29D6A0]', label: 'VERIFIED' },
    PASSED: { color: 'text-[#29D6A0]', bg: 'bg-[#29D6A0]/8', border: 'border-[#29D6A0]/25', dot: 'bg-[#29D6A0]', label: 'PASSED' },
    COMPLETED: { color: 'text-[#29D6A0]', bg: 'bg-[#29D6A0]/8', border: 'border-[#29D6A0]/25', dot: 'bg-[#29D6A0]', label: 'COMPLETED' },
    ACTIVE: { color: 'text-[#62DCEB]', bg: 'bg-[#62DCEB]/8', border: 'border-[#62DCEB]/25', dot: 'bg-[#62DCEB]', label: 'ACTIVE' },
    NEEDS_REVIEW: { color: 'text-[#F2BB5B]', bg: 'bg-[#F2BB5B]/8', border: 'border-[#F2BB5B]/25', dot: 'bg-[#F2BB5B]', label: 'NEEDS REVIEW' },
    PENDING: { color: 'text-[#F2BB5B]', bg: 'bg-[#F2BB5B]/8', border: 'border-[#F2BB5B]/25', dot: 'bg-[#F2BB5B]', label: 'PENDING' },
    UNCERTAIN: { color: 'text-[#F2BB5B]', bg: 'bg-[#F2BB5B]/8', border: 'border-[#F2BB5B]/25', dot: 'bg-[#F2BB5B]', label: 'UNCERTAIN' },
    AWAITING_EVIDENCE: { color: 'text-[#8B7CFF]', bg: 'bg-[#8B7CFF]/8', border: 'border-[#8B7CFF]/25', dot: 'bg-[#8B7CFF]', label: 'AWAITING EVIDENCE' },
    INSUFFICIENT_EVIDENCE: { color: 'text-[#F16D7A]', bg: 'bg-[#F16D7A]/8', border: 'border-[#F16D7A]/25', dot: 'bg-[#F16D7A]', label: 'INSUFFICIENT EVIDENCE' },
    FAILED: { color: 'text-[#F16D7A]', bg: 'bg-[#F16D7A]/8', border: 'border-[#F16D7A]/25', dot: 'bg-[#F16D7A]', label: 'FAILED' },
    INCOMPLETE: { color: 'text-[#94A3B8]', bg: 'bg-[#192232]', border: 'border-[rgba(148,163,184,0.18)]', dot: 'bg-[#64748B]', label: 'INCOMPLETE' },
  };

  const style = config[normalized] || {
    color: 'text-[#94A3B8]',
    bg: 'bg-[#121824]',
    border: 'border-[rgba(148,163,184,0.15)]',
    dot: 'bg-[#94A3B8]',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded border ${style.color} ${style.bg} ${style.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      <span>{style.label}</span>
    </span>
  );
};

// Subtle line divider
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`border-t border-[rgba(148,163,184,0.08)] ${className}`} />;
};

// Minimal live blinking status indicator
export const LiveIndicator: React.FC<{ label?: string; color?: string }> = ({
  label = 'LIVE',
  color = 'bg-[#29D6A0]',
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
      </span>
      <span>{label}</span>
    </div>
  );
};
