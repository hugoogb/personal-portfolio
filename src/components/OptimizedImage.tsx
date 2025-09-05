import type { FC } from 'react';
import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  lazy?: boolean;
  showBlur?: boolean;
  quality?: number;
}

export const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  alt,
  lazy = true,
  showBlur = true,
  quality = 85,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  const shouldLoad = lazy ? isVisible : true;

  return (
    <div ref={ref} className={className}>
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          quality={quality}
          placeholder={showBlur ? 'blur' : 'empty'}
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          onLoad={() => setIsLoaded(true)}
          style={{
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0.7,
          }}
          {...props}
        />
      )}
    </div>
  );
};