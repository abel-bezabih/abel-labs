'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// High-quality visuals of mobile apps and websites
// Mix of images and videos showcasing beautiful designs
// TIP: Replace these with your own project screenshots/videos for best results!
// Free sources: Unsplash (images), Pexels (videos), Pixabay (both)
const slides = [
  // Website designs - high quality images
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1920&q=100&auto=format&fit=crop',
    alt: 'Modern website dashboard design',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=100&auto=format&fit=crop',
    alt: 'E-commerce website interface',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=100&auto=format&fit=crop',
    alt: 'Analytics dashboard website',
  },
  // Mobile app designs
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920&q=100&auto=format&fit=crop',
    alt: 'Mobile app interface design',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=1920&q=100&auto=format&fit=crop',
    alt: 'Mobile app screens showcase',
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&q=100&auto=format&fit=crop',
    alt: 'Beautiful mobile UI design',
  },
  // Video examples (uncomment and add your video URLs)
  // Get free videos from: https://www.pexels.com/videos/ or https://pixabay.com/videos/
  // {
  //   type: 'video',
  //   url: 'https://videos.pexels.com/video-files/website-demo.mp4',
  //   alt: 'Website demo video',
  // },
  // {
  //   type: 'video',
  //   url: 'https://videos.pexels.com/video-files/mobile-app-demo.mp4',
  //   alt: 'Mobile app demo video',
  // },
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          if (index !== currentIndex) return null;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {slide.type === 'image' ? (
                <div className="relative w-full h-full">
                  <img
                    src={slide.url}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    sizes="100vw"
                    style={{ objectPosition: 'center' }}
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-black/30" />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/15 to-transparent" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={slide.url} type="video/mp4" />
                  </video>
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-black/30" />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/15 to-transparent" />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

