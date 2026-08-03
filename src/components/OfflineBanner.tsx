import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline  = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 max-w-md mx-auto"
        >
          <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 flex items-center gap-2 shadow-lg">
            <WifiOff size={15} className="flex-shrink-0 text-amber" />
            <span>You're offline — showing cached content. Multiplayer unavailable.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
