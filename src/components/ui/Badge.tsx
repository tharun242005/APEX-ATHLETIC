import React from 'react'
import { motion } from 'framer-motion'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
  animated?: boolean
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  animated = false,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center font-bold rounded-full
    transition-all duration-300 ease-in-out
  `

  const variantClasses = {
    default: 'bg-slate-700 text-slate-300 border border-slate-600',
    success: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    premium: 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3 mr-1',
    md: 'w-4 h-4 mr-2',
    lg: 'w-5 h-5 mr-2'
  }

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim()

  const iconElement = icon && (
    <span className={iconSizeClasses[size]}>
      {icon}
    </span>
  )

  if (animated) {
    return (
      <motion.span
        className={classes}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "backOut" }}
        {...props}
      >
        {iconElement}
        {children}
      </motion.span>
    )
  }

  return (
    <span
      className={classes}
      {...props}
    >
      {iconElement}
      {children}
    </span>
  )
}

export default Badge