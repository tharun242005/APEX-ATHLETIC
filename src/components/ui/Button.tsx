import React from 'react'
import { motion } from 'framer-motion'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-bold
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses = {
    primary: `
      text-white border-0
      focus:ring-cyan-500 focus:ring-offset-slate-900
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-transparent hover:bg-opacity-10
      text-cyan-400 border border-cyan-400 hover:border-cyan-300
      focus:ring-cyan-500 focus:ring-offset-slate-900
      hover:text-cyan-300
    `,
    tertiary: `
      bg-slate-700 hover:bg-slate-600 active:bg-slate-500
      text-slate-200 border border-slate-600
      focus:ring-slate-500 focus:ring-offset-slate-900
    `,
    ghost: `
      bg-transparent hover:bg-slate-800/50 active:bg-slate-800
      text-slate-400 hover:text-slate-200
      focus:ring-slate-500 focus:ring-offset-slate-900
      border-0
    `
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-12 py-6 text-xl rounded-3xl'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim()

  const iconElement = icon && (
    <span className={`${iconSizeClasses[size]} ${iconPosition === 'left' ? 'mr-3' : 'ml-3'}`}>
      {icon}
    </span>
  )

  const loadingSpinner = loading && (
    <svg
      className={`${iconSizeClasses[size]} animate-spin mr-3`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...(props as any)}
    >
      {loading && loadingSpinner}
      {!loading && icon && iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && iconElement}
    </motion.button>
  )
}

export default Button