import React from "react";

// NOTE: In your actual Nextron/Next.js app, uncomment the following imports:
// import Head from 'next/head';
// import Link from 'next/link';

export default function AboutPage() {
  return (
    <React.Fragment>
      {/* In Next.js, use <Head> to set the title. For this preview, we skip it.
      <Head>
        <title>About - Nextron</title>
      </Head>
      */}

      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4 text-green-400">About Page</h1>
        <p className="mb-8 max-w-md text-center text-gray-300">
          This page demonstrates client-side routing in Electron. Notice how the
          window didn't flash white? That's the power of Next.js SPA routing.
        </p>

        {/* NOTE: In your actual app, use the Next.js Link component:
            <Link href="/home" className="...">
              &larr; Back to Home
            </Link>
        */}
        <a
          href="/home"
          className="px-6 py-3 border border-green-400 text-green-400 rounded hover:bg-green-400 hover:text-gray-900 transition"
        >
          &larr; Back to Home
        </a>
      </div>
    </React.Fragment>
  );
}
