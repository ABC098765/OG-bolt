import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
        </div>
        
        {/* Description Skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        
        {/* Price and Button Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;