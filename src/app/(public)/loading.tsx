export default function PublicLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page"
      className="min-h-[70vh] bg-slate-50 px-6 py-16"
    >
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-16 max-w-3xl rounded bg-slate-200" />
        <div className="h-6 max-w-xl rounded bg-slate-200" />
        <div className="h-12 w-36 rounded-xl bg-slate-200" />
      </div>
    </main>
  );
}
