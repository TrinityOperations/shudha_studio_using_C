"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-slate-950">
        <main className="max-w-md text-center" id="main-content" role="alert">
          <h1 className="text-3xl font-semibold">
            Something went wrong / সমস্যা হয়েছে
          </h1>
          <p className="mt-4 text-slate-600">
            We couldn’t load this page. Please try again. / পৃষ্ঠাটি লোড করা যায়নি।
            আবার চেষ্টা করুন।
          </p>
          <button
            className="mt-6 rounded-full bg-rose-700 px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            onClick={reset}
            type="button"
          >
            Try again / আবার চেষ্টা করুন
          </button>
        </main>
      </body>
    </html>
  );
}
