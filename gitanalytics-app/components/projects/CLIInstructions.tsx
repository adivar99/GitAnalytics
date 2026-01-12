'use client';

import { useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

export function CLIInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-semibold">
            📋 How to use the CLI Configuration
          </span>
        </div>
        {isExpanded ? (
          <BsChevronUp className="text-blue-700" />
        ) : (
          <BsChevronDown className="text-blue-700" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-2">Step 1: Download the configuration file</p>
            <p>Click the "Download CLI Config" button above to get your pre-configured <code className="bg-gray-200 px-1 rounded">gitanalytics.yml</code> file.</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Step 2: Place the file in your repository</p>
            <p>Move the downloaded <code className="bg-gray-200 px-1 rounded">gitanalytics.yml</code> file to the root directory of your git repository.</p>
          </div>

          <div>
            <p className="font-semibold mb-2">Step 3: Install the CLI</p>
            <p>Download the GitAnalytics CLI executable for your platform or build it from source:</p>
            <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`cd cli
make build
# Binary will be at: bin/gitanalytics-cli`}
            </pre>
          </div>

          <div>
            <p className="font-semibold mb-2">Step 4: Run the analysis</p>
            <p>Execute the CLI in your repository directory:</p>
            <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-2 overflow-x-auto">
{`./bin/gitanalytics-cli`}
            </pre>
            <p className="mt-2 text-xs text-gray-600">
              The CLI will automatically read the <code className="bg-gray-200 px-1 rounded">gitanalytics.yml</code> file and use your user and project IDs.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Analytics data will be written to <code className="bg-gray-200 px-1 rounded">analytics_output.json</code> for review.
            </p>
          </div>

          <div>
            <p className="font-semibold mb-2">Optional: Customize the configuration</p>
            <p>You can uncomment and modify sections in the <code className="bg-gray-200 px-1 rounded">gitanalytics.yml</code> file to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Exclude specific branches from analysis</li>
              <li>Exclude files/directories (e.g., node_modules, vendor, dist)</li>
              <li>Select which analytics functions to run</li>
              <li>Configure custom server host and port</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
            <p className="font-semibold text-yellow-800 mb-1">⚠️ Important</p>
            <p className="text-yellow-700 text-xs">
              Keep your <code className="bg-yellow-100 px-1 rounded">gitanalytics.yml</code> file secure as it contains your user and project IDs.
              Consider adding it to <code className="bg-yellow-100 px-1 rounded">.gitignore</code> if you don't want to commit it to version control.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

