import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-4 px-4 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center hover:text-green-600 transition-colors">
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href && !item.current ? (
            <Link 
              href={item.href} 
              className="hover:text-green-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? 'text-gray-900 dark:text-white font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;