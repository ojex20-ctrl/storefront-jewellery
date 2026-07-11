export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
      <div className="mb-10 h-10 w-56 animate-pulse rounded bg-bg-2" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] w-full animate-pulse rounded bg-bg-2" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-bg-2" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-bg-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
