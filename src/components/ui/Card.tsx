import React from 'react'
import { motion } from 'framer-motion'

export interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  style?: React.CSSProperties
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'md',
  onClick,
  style,
  ...props
}) => {
  const baseClasses = `
    bg-slate-800 border border-slate-700
    transition-all duration-300 ease-in-out
    ${onClick ? 'cursor-pointer' : ''}
  `

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const hoverClasses = hover ? `
    hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10
    hover:-translate-y-1
  ` : ''

  const glowClasses = glow ? `
    shadow-lg shadow-cyan-500/20 border-cyan-500/30
  ` : ''

  const classes = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${glowClasses}
    ${className}
  `.trim()

  const MotionComponent = onClick ? motion.div : 'div'
  const motionProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <MotionComponent
      className={classes}
      onClick={onClick}
      style={style}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

export default Card