'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@payloadcms/ui'
import { RichText } from '@/components/RichText'
import { getMediaBlurUrl } from '@/lib/utils'

export const HighImpactHero: React.FC<Page['hero']> = ({links, media, richText }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 8000) // Longer interval for video slides

    return () => clearInterval(interval)
  }, [currentSlide])

  const nextSlide = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      const length = Array.isArray(media) ? media.length : 0
      setCurrentSlide((prev) => (prev === length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 500)
  }

  const prevSlide = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      const length = Array.isArray(media) ? media.length : 0
      setCurrentSlide((prev) => (prev === 0 ? length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 500)
  }

  return (
    <div className="relative h-[60vh] w-full overflow-hidden">
      {/* Video Slides */}
      {Array.isArray(media) &&
        media.length > 0 &&
        media?.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {/* Video Background with Overlay */}
            <div className="absolute inset-0">
              {item && typeof item === 'object' && (
                <Media fill imgClassName="object-cover" priority resource={item.image} blurhash={getMediaBlurUrl(item.image)}/>
              )}
            </div>
          </div>
        ))}
      {/* Content */}
      <div className="relative h-full flex justify-center mx-auto items-center z-20">
        <div className="container mx-auto px-4 lg:px-8 pt-16">
          <div className="max-w-full flex flex-col items-start bg-transparent">
            {richText && <RichText enableProse={false} className='hero-richtext text-white' data={richText} />}
          </div>
        </div>
      </div>
      {/* Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 text-white transition"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-2 text-white transition"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-2">
        {Array.isArray(media) &&
          media.length > 0 &&
          media?.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-accent' : 'bg-white/50 hover:bg-white/80'
                }`}
              onClick={() => goToSlide(index)}
            />
          ))}
      </div>
    </div>
  )
}