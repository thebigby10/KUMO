import React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = "", rounded = "rounded-lg" }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

export function LabCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-72">
      <Skeleton className="h-32 w-full" rounded="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-9 h-9 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        {lines > 1 && <Skeleton className="h-3 w-1/2" />}
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
