'use client';

import { useState, useRef } from 'react';
import { FileUploadComponent } from '@/components/FileUploadComponent';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const [filename, setFilename] = useState<string>('');
  const chatInterfaceRef = useRef<{ resetMessages: () => void }>(null);

  const handleFileProcessed = (newFilename: string) => {
    setFilename(newFilename);
    // Reset chat when new file is uploaded
    chatInterfaceRef.current?.resetMessages();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-[85%] flex-col items-center justify-between py-1 px-2 bg-white dark:bg-black rounded-lg">
        <div className="w-full">
    
          
          {/* File Upload Section */}
          <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            {/* <h2 className="text-2xl mb-4 text-black dark:text-zinc-50">File Upload</h2> */}
            <div className="flex justify-center items-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              <FileUploadComponent onFileProcessed={handleFileProcessed} />
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h2 className="text-2xl mb-4 text-black dark:text-zinc-50">Chat Interface</h2>
            <div className="h-96 bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
              <ChatInterface ref={chatInterfaceRef} filename={filename} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
