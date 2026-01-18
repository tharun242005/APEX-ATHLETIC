import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Video, FileVideo, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import BackgroundAnimation from '../BackgroundAnimation'

export default function UploadVideoPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setUploadedFile(file)
      setUploadStatus('idle')
    } else {
      setUploadStatus('error')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) return
    
    setUploading(true)
    setUploadStatus('idle')
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false)
      setUploadStatus('success')
    }, 2000)
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0D1B2A' }}>
      {/* Background Animation */}
      <BackgroundAnimation blur={true} intensity="medium" sportsTheme={true} />
      
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'Bebas Neue, Impact, Arial Black, sans-serif',
                color: '#FFFFFF'
              }}
            >
              Upload Video Analysis
            </h1>
            <p className="text-xl" style={{ color: '#8A9BA8' }}>
              Upload your sports performance video for AI-powered analysis
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-8" style={{ backgroundColor: '#1B263B', border: '2px solid rgba(0, 245, 212, 0.2)' }}>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  borderColor: dragActive ? '#00F5D4' : 'rgba(139, 92, 246, 0.3)',
                  backgroundColor: dragActive ? 'rgba(0, 245, 212, 0.05)' : 'transparent'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {!uploadedFile ? (
                  <div>
                    <motion.div
                      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 245, 212, 0.1)' }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Upload className="w-10 h-10" style={{ color: '#00F5D4' }} />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
                      Drop your video here
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#8A9BA8' }}>
                      or click to browse files
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: '#8A9BA8' }}>
                      <span>MP4, MOV, AVI</span>
                      <span>•</span>
                      <span>Max 100MB</span>
                      <span>•</span>
                      <span>HD Quality</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 245, 212, 0.1)' }}
                    >
                      <FileVideo className="w-10 h-10" style={{ color: '#00F5D4' }} />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
                      {uploadedFile.name}
                    </h3>
                    <p className="text-lg mb-6" style={{ color: '#8A9BA8' }}>
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        variant="primary"
                        icon={uploading ? undefined : <Video className="w-5 h-5" />}
                        className="px-8 py-3"
                      >
                        {uploading ? 'Uploading...' : 'Analyze Video'}
                      </Button>
                      <Button
                        onClick={resetUpload}
                        variant="secondary"
                        className="px-8 py-3"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence>
            {uploadStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <Card className="p-6" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: '#10B981' }}>
                        Upload Successful!
                      </h4>
                      <p style={{ color: '#8A9BA8' }}>
                        Your video is being processed. Analysis results will be available shortly.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {uploadStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <Card className="p-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-6 h-6" style={{ color: '#EF4444' }} />
                    <div>
                      <h4 className="font-bold text-lg" style={{ color: '#EF4444' }}>
                        Upload Failed
                      </h4>
                      <p style={{ color: '#8A9BA8' }}>
                        Please select a valid video file (MP4, MOV, AVI).
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Video className="w-8 h-8" />,
                title: "AI Analysis",
                description: "Advanced computer vision analyzes your technique, form, and performance metrics."
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Detailed Reports",
                description: "Get comprehensive reports with actionable insights and improvement recommendations."
              },
              {
                icon: <Upload className="w-8 h-8" />,
                title: "Progress Tracking",
                description: "Track your improvement over time with detailed performance analytics."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 h-full" style={{ backgroundColor: '#1B263B', border: '1px solid rgba(0, 245, 212, 0.1)' }}>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 245, 212, 0.1)' }}
                    >
                      <div style={{ color: '#00F5D4' }}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#8A9BA8' }}>
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
