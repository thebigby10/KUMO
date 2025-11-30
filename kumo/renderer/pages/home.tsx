import React, { useState, useEffect } from "react";

// NOTE: In your actual Nextron/Next.js app, uncomment the following imports:
// import Head from 'next/head';
// import Link from 'next/link';

export default function HomePage() {
  const [ipcMessage, setIpcMessage] = useState("");

  // Function to talk to background.ts
  const sendPing = () => {
    // Check if window.ipc exists (it might not in the web preview)
    if (typeof window !== "undefined" && window.ipc) {
      window.ipc.send("ping", "Hello from the Home Page!");
    } else {
      console.log("IPC not available in browser preview");
      setIpcMessage("IPC not available in browser preview");
    }
  };

  useEffect(() => {
    // Listen for the 'pong' reply from background.ts
    if (typeof window !== "undefined" && window.ipc) {
      window.ipc.on("pong", (event: any, arg: string) => {
        setIpcMessage(arg);
      });
    }
  }, []);

  return (
    <React.Fragment>
      {/* In Next.js, use <Head> to set the title. For this preview, we skip it.
      <Head>
        <title>Home - Nextron</title>
      </Head>
      */}

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-800">
        <h1 className="text-5xl font-bold mb-4 text-blue-600">Hello World</h1>
        <p className="mb-8 text-xl">
          This is the Home Page running in Electron.
        </p>

        {/* IPC Demo Section */}
        <div className="p-6 bg-white rounded shadow-md text-center mb-8">
          <p className="mb-2 font-semibold">IPC Status:</p>
          <p className="mb-4 text-sm text-gray-500 font-mono">
            {ipcMessage || "No message received yet"}
          </p>
          <button
            onClick={sendPing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Ping Background Process
          </button>
        </div>

        {/* Routing Link
            NOTE: In your actual app, use: <Link href="/about">Go to About Page &rarr;</Link>
        */}
        <a href="/about" className="text-blue-500 hover:underline text-lg">
          Go to About Page &rarr;
        </a>
      </div>
    </React.Fragment>
  );
}
