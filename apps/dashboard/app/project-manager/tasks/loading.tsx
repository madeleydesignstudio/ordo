import { Skeleton } from "@workspace/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <div className="space-x-4">
            <Skeleton className="h-10 w-24 inline-block" />
            <Skeleton className="h-10 w-24 inline-block" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((column) => (
            <div key={column} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              {[1, 2].map((task) => (
                <Skeleton key={task} className="h-40 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
