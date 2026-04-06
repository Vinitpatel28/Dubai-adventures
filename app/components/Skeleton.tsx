"use client";

import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-[pulse_2s_infinite] bg-[var(--bw5)] rounded-xl relative overflow-hidden ${className || ""}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent" />
    </div>
  );
}

export function BookingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start anim-fade-in opacity-50">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[var(--s1)] border border-[var(--bw1)] space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel Skeleton */}
      <div className="lg:col-span-8 bg-[var(--s1)] border border-[var(--bw1)] rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
        <Skeleton className="h-[400px] w-full rounded-none" />
        <div className="px-8 sm:px-12 pb-12 -mt-24 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-8 rounded-2xl bg-[var(--s2)]/40 border border-[var(--bw1)] space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
          <div className="md:col-span-5 space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
