'use client';

import { useState } from 'react';
import { BsDownload } from 'react-icons/bs';
import { generateGitAnalyticsYaml, downloadYamlFile } from '@/lib/utils/yamlGenerator';

interface DownloadConfigButtonProps {
  userId: string;
  projectId: string;
  className?: string;
}

export function DownloadConfigButton({ userId, projectId, className = '' }: DownloadConfigButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      const yamlContent = generateGitAnalyticsYaml(userId, projectId);
      downloadYamlFile(yamlContent);
      
      // Reset state after a short delay
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to download config file:', error);
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      title="Download .gitanalytics configuration file"
    >
      <BsDownload className="w-4 h-4" />
      {isDownloading ? 'Downloading...' : 'Download CLI Config'}
    </button>
  );
}

