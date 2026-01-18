import React from 'react'
import { motion } from 'framer-motion'
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' }
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Blog', href: '#blog' },
      { name: 'Press', href: '#press' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'Status', href: '#status' },
      { name: 'Community', href: '#community' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' }
    ]
  }

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/apexathletic' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/apexathletic' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/apexathletic' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/tharun242005' }
  ]

  return (
    <footer style={{ backgroundColor: '#0D1B2A', borderTop: '1px solid rgba(0, 245, 212, 0.1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #00F5D4 0%, #4ECDC4 100%)',
                    boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)'
                  }}
                >
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
                    color: '#FFFFFF'
                  }}
                >
                  APEX ATHLETIC
                </span>
              </div>
              <p className="text-xl leading-relaxed mb-8 max-w-md" style={{ color: '#8A9BA8' }}>
                The future of talent assessment. AI-powered sports analytics platform 
                that transforms how athletes train, compete, and excel.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center" style={{ color: '#8A9BA8' }}>
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="text-lg">run40081@gmail.com</span>
                </div>
                <div className="flex items-center" style={{ color: '#8A9BA8' }}>
                  <Phone className="w-5 h-5 mr-3" />
                  <span className="text-lg">9731783858</span>
                </div>
                <div className="flex items-center" style={{ color: '#8A9BA8' }}>
                  <MapPin className="w-5 h-5 mr-3" />
                  <span className="text-lg">bengaluru,india</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([section, links], index) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 
                className="font-bold text-xl mb-6 capitalize"
                style={{ color: '#FFFFFF' }}
              >
                {section}
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-lg transition-colors duration-300 hover:text-cyan-400"
                      style={{ color: '#8A9BA8' }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8"
          style={{ borderTop: '1px solid rgba(0, 245, 212, 0.1)' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-8 mb-6 sm:mb-0">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-300 hover:text-cyan-400"
                    style={{ color: '#8A9BA8' }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.a>
                )
              })}
            </div>
            
            <div className="text-lg" style={{ color: '#8A9BA8' }}>
              © {currentYear} APEX ATHLETIC. All rights reserved.
            </div>
          </div>
        </motion.div>

        {/* Prototype Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 text-center"
          style={{ borderTop: '1px solid rgba(0, 245, 212, 0.1)' }}
        >
          <div 
            className="inline-flex items-center px-6 py-3 rounded-full"
            style={{ 
              backgroundColor: 'rgba(0, 245, 212, 0.1)',
              border: '1px solid rgba(0, 245, 212, 0.3)'
            }}
          >
            <span className="text-lg font-bold" style={{ color: '#00F5D4' }}>
              PROTOTYPE BY THARUN.P
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer