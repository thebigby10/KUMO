"use client";

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  name: string | null;
  email: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-12 h-12",
};

export default function Avatar({
  name,
  email,
  avatar,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getDicebearUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const displayName = name || email;
  const imageUrl = avatar && !imageError ? avatar : getDicebearUrl(email);

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex-shrink-0`}>
      <Image
        src={imageUrl}
        alt={displayName}
        fill
        className="rounded-full object-cover ring-2 ring-slate-600 bg-white"
        onError={() => setImageError(true)}
        unoptimized={!avatar || imageError}
      />
    </div>
  );
}
