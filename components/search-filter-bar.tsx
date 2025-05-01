"use client"

interface SearchFilterBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  activeFilter: "all" | "low" | "critical" | "healthy"
  setActiveFilter: (filter: "all" | "low" | "critical" | "healthy") => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
  categories: string[]
}

export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  viewMode,
  setViewMode,
  categoryFilter,
  setCategoryFilter,
  categories,
}: SearchFilterBarProps) {
  return (
    <div
      className="bg-white border-b border-gray-200 sticky top-16 z-10 animate-slide-down"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col space-y-3">
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="Search fabrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <div className="flex flex-wrap gap-1 md:gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2 py-1 md:px-3 text-xs sm:text-sm rounded-md whitespace-nowrap cursor-pointer transition-all duration-200 button-pop ${
                  activeFilter === "all"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setActiveFilter("low")}
                className={`px-2 py-1 md:px-3 text-xs sm:text-sm rounded-md whitespace-nowrap cursor-pointer transition-all duration-200 button-pop ${
                  activeFilter === "low"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-exclamation-triangle mr-1 text-yellow-500"></i>
                <span className="hidden md:inline">Low Stock</span>
                <span className="md:hidden">Low</span>
              </button>
              <button
                onClick={() => setActiveFilter("critical")}
                className={`px-2 py-1 md:px-3 text-xs sm:text-sm rounded-md whitespace-nowrap cursor-pointer transition-all duration-200 button-pop ${
                  activeFilter === "critical"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-exclamation-circle mr-1 text-red-500"></i>
                <span className="hidden md:inline">Critical Stock</span>
                <span className="md:hidden">Critical</span>
              </button>
            </div>
            <div className="flex items-center border-l border-gray-300 pl-2 md:pl-4 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${viewMode === "grid" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${viewMode === "list" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Category filter chips */}
        <div className="flex flex-wrap items-center mt-3 gap-1 md:gap-2">
          <span className="text-xs md:text-sm text-gray-500 mr-1 md:mr-2">Categories:</span>
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-2 py-0.5 md:px-3 md:py-1 text-xs rounded-full whitespace-nowrap cursor-pointer transition-all duration-200 button-pop ${
              categoryFilter === null ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-2 py-0.5 md:px-3 md:py-1 text-xs rounded-full whitespace-nowrap cursor-pointer transition-all duration-200 button-pop ${
                  categoryFilter === category
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
