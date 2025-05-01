"use client"

import Image from "next/image"
import type { Fabric } from "@/types/fabric"
import { getStockStatus } from "@/lib/utils"

interface DetailModalProps {
  fabric: Fabric
  onClose: () => void
}

export default function DetailModal({ fabric, onClose }: DetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-y-auto max-h-[90vh] modal-content">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Fabric Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200 button-pop"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-1/3 relative animate-fade-in">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={fabric.imageUrl || "/placeholder.svg"}
                  alt={fabric.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{fabric.name}</h2>
                <p className="text-lg text-indigo-600 font-medium mb-6">${fabric.price.toFixed(2)}/yd</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                  <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Category</h3>
                    <p className="text-sm text-gray-700">{fabric.category}</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Supplier</h3>
                    <p className="text-sm text-gray-700">{fabric.supplier}</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Color</h3>
                    <p className="text-sm text-gray-700">{fabric.color}</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Width</h3>
                    <p className="text-sm text-gray-700">{fabric.width}cm</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Composition</h3>
                    <p className="text-sm text-gray-700">{fabric.composition}</p>
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Last Updated</h3>
                    <p className="text-sm text-gray-700">{fabric.lastUpdated}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-gray-50 rounded-lg animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Stock Level</h3>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      getStockStatus(fabric) === "critical"
                        ? "bg-red-100 text-red-800"
                        : getStockStatus(fabric) === "low"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    <i
                      className={`fas fa-circle mr-2 text-xs ${
                        getStockStatus(fabric) === "critical"
                          ? "text-red-500"
                          : getStockStatus(fabric) === "low"
                            ? "text-yellow-500"
                            : "text-green-500"
                      }`}
                    ></i>
                    {fabric.stockLevel} yards
                  </span>
                  <span className="text-sm text-gray-500 font-medium">Minimum: {fabric.minStockLevel} yards</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 stock-bar ${
                      getStockStatus(fabric) === "critical"
                        ? "bg-red-500"
                        : getStockStatus(fabric) === "low"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (fabric.stockLevel / (fabric.minStockLevel * 2)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-md whitespace-nowrap cursor-pointer transition-all duration-200 text-sm font-medium button-pop hover:shadow-md">
                  <i className="fas fa-edit mr-2"></i>
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
