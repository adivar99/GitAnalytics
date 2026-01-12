'use client';

import { useState, useRef, useEffect } from 'react';
import { BsDownload, BsChevronDown } from 'react-icons/bs';
import { FiFile, FiTerminal } from 'react-icons/fi';
import { generateGitAnalyticsYaml, downloadYamlFile } from '@/lib/utils/yamlGenerator';

interface DownloadConfigButtonProps {
  userId: string;
  projectId: string;
  className?: string;
}

export function DownloadConfigButton({ userId, projectId, className = '' }: DownloadConfigButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadYaml = () => {
    setIsDownloading(true);
    setIsOpen(false);

    try {
      const yamlContent = generateGitAnalyticsYaml(userId, projectId);
      downloadYamlFile(yamlContent);

      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to download config file:', error);
      setIsDownloading(false);
    }
  };

  const handleDownloadCLI = () => {
    setIsDownloading(true);
    setIsOpen(false);

    try {
      // Create a temporary link to download the CLI from public folder
      const link = document.createElement('a');
      link.href = '/gitanalytics-cli';
      link.download = 'gitanalytics-cli';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to download CLI:', error);
      setIsDownloading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Download CLI resources"
      >
        <BsDownload className="w-4 h-4" />
        {isDownloading ? 'Downloading...' : 'Download'}
        <BsChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={handleDownloadYaml}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiFile className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">YAML Config</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">gitanalytics.yml</div>
              </div>
            </button>

            <button
              onClick={handleDownloadCLI}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiTerminal className="w-4 h-4 text-green-500" />
              <div className="text-left">
                <div className="font-medium">CLI Executable</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Linux binary</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

