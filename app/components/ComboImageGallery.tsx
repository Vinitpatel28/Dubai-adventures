import React from "react";
import Image from "next/image";

interface Props {
  images: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export default function ComboImageGallery({ images, className = "w-full h-full", size = 'md' }: Props) {
  // Filter out any empty strings/undefined
  const validImages = images?.filter(Boolean) || [];

  if (validImages.length === 0) {
    return (
      <div className={`relative flex items-center justify-center bg-[var(--bw2)] ${className}`}>
        <span className="text-[0.6rem] font-bold text-[var(--t4)] uppercase tracking-widest">No Image</span>
      </div>
    );
  }

  // Deduplicate images just in case the same activity was added twice (shouldn't happen, but good practice)
  const uniqueImages = Array.from(new Set(validImages));

  // Regular single image
  if (uniqueImages.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <Image src={uniqueImages[0]} alt="Combo Experience" fill className="object-cover" />
      </div>
    );
  }

  // 2 Images Layout: 50/50 vertical split
  if (uniqueImages.length === 2) {
    return (
      <div className={`relative flex gap-1 bg-[var(--bw1)] ${className}`}>
        <div className="relative w-1/2 h-full overflow-hidden">
          <Image src={uniqueImages[0]} alt="Experience 1" fill className="object-cover" />
        </div>
        <div className="relative w-1/2 h-full overflow-hidden">
          <Image src={uniqueImages[1]} alt="Experience 2" fill className="object-cover" />
        </div>
      </div>
    );
  }

  // 3+ Images Layout: Large Left (50%), Right Stacked 2 High
  return (
    <div className={`relative flex gap-1 bg-[var(--bw1)] ${className}`}>
      {/* Left side: Large prominent image */}
      <div className="relative w-1/2 h-full overflow-hidden">
        <Image src={uniqueImages[0]} alt="Main Experience" fill className="object-cover" />
      </div>
      
      {/* Right side: 2 smaller images stacked vertically */}
      <div className="relative w-1/2 h-full flex flex-col gap-1">
        <div className="relative w-full h-1/2 overflow-hidden">
          <Image src={uniqueImages[1]} alt="Experience 2" fill className="object-cover" />
        </div>
        <div className="relative w-full h-1/2 overflow-hidden">
          <Image src={uniqueImages[2]} alt="Experience 3" fill className="object-cover" />
          
          {/* If more than 3 images, overlay "+X MORE" */}
          {uniqueImages.length > 3 && (
            <div className="absolute inset-0 bg-[#05030A]/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-[var(--t1)] font-black tracking-[0.2em] uppercase drop-shadow-md" style={{ fontSize: size === 'sm' ? '0.5rem' : '0.65rem' }}>
                +{uniqueImages.length - 3} More
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
