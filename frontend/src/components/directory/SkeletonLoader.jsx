export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-border"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-border rounded w-3/4"></div>
        <div className="h-4 bg-border rounded w-1/2"></div>
        <div className="h-4 bg-border rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-border rounded-full w-20"></div>
          <div className="h-10 bg-border rounded-full w-20"></div>
          <div className="h-10 bg-border rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] animate-pulse">
      <div className="h-[280px] bg-border rounded-2xl"></div>
    </div>
  );
}

export function CitySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-border rounded-2xl"></div>
    </div>
  );
}
