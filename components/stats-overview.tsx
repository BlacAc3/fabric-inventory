"use client"

import type { Fabric } from "@/types/fabric"

interface StatsOverviewProps {
  fabrics: Fabric[]
  setActiveFilter: (filter: "all" | "low" | "critical" | "healthy") => void
  setCategoryFilter: (category: string | null) => void
}

export default function StatsOverview({ fabrics, setActiveFilter, setCategoryFilter }: StatsOverviewProps) {
  const lowStockCount = fabrics.filter(
    (f) => f.stockLevel <= f.minStockLevel && f.stockLevel > f.minStockLevel / 2,
  ).length

  const criticalStockCount = fabrics.filter((f) => f.stockLevel <= f.minStockLevel / 2).length

  const healthyStockCount = fabrics.filter((f) => f.stockLevel > f.minStockLevel).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        onClick={() => {
          setActiveFilter("all")
          setCategoryFilter(null)
        }}
        className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500 cursor-pointer hover:bg-indigo-50 transition-all duration-200 hover-lift stagger-item"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
            <i className="fas fa-layer-group text-indigo-500"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Total Fabrics</h2>
            <p className="text-2xl font-semibold text-gray-800">{fabrics.length}</p>
          </div>
        </div>
      </div>
      <div
        onClick={() => {
          setActiveFilter("low")
          setCategoryFilter(null)
        }}
        className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition-all duration-200 hover-lift stagger-item"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
            <i className="fas fa-exclamation-triangle text-yellow-500"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Low Stock</h2>
            <p className="text-2xl font-semibold text-gray-800">{lowStockCount}</p>
          </div>
        </div>
      </div>
      <div
        onClick={() => {
          setActiveFilter("critical")
          setCategoryFilter(null)
        }}
        className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500 cursor-pointer hover:bg-red-50 transition-all duration-200 hover-lift stagger-item"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
            <i className="fas fa-exclamation-circle text-red-500"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Critical Stock</h2>
            <p className="text-2xl font-semibold text-gray-800">{criticalStockCount}</p>
          </div>
        </div>
      </div>
      <div
        onClick={() => {
          setActiveFilter("healthy")
          setCategoryFilter(null)
        }}
        className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 cursor-pointer hover:bg-green-50 transition-all duration-200 hover-lift stagger-item"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
            <i className="fas fa-check-circle text-green-500"></i>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Healthy Stock</h2>
            <p className="text-2xl font-semibold text-gray-800">{healthyStockCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
