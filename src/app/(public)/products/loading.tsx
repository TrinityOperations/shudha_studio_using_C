import { PageContainer } from "@/components/public/page-container";

export default function ProductsLoading() {
  return (
    <main className="min-h-[70vh] bg-slate-50 py-16">
      <PageContainer>
        <div className="animate-pulse space-y-5">
          <div className="h-12 max-w-sm rounded bg-slate-200" />
          <div className="h-24 rounded-2xl bg-slate-200" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="h-80 rounded-2xl bg-slate-200" key={index} />
            ))}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
