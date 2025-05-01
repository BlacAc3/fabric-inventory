import LoadingSpinner from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="text-center animate-fade-in">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading inventory...</p>
      </div>
    </div>
  )
}
