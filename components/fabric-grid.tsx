"use client"

import Image from "next/image"
import type { Fabric } from "@/types/fabric"
import { getStockStatus } from "@/lib/utils"

interface FabricGridProps {
  fabrics: Fabric[]
  cardSize: "S" | "M" | "L"
  onItemClick: (fabric: Fabric) => void
}

export default function FabricGrid({ fabrics, cardSize, onItemClick }: FabricGridProps) {
  // Get card size class
  const getCardSizeClass = () => {
    switch (cardSize) {
      case "S":
        return "w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
      case "L":
        return "w-full sm:w-full md:w-1/2 lg:w-1/2"
      default:
        return "w-full sm:w-1/2 md:w-1/2 lg:w-1/3"
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
      {fabrics.map((fabric, index) => (
        <div
          key={fabric.id}
          onClick={() => onItemClick(fabric)}
          className={`bg-white rounded-lg shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md cursor-pointer hover-scale stagger-item ${
            getStockStatus(fabric) === "critical"
              ? "border-l-4 border-red-500"
              : getStockStatus(fabric) === "low"
                ? "border-l-4 border-yellow-500"
                : "border-l-4 border-green-500"
          }`}
        >
          <div className="relative h-40 md:h-48 overflow-hidden">
            <Image
              src={fabric.imageUrl || "/placeholder.svg"}
              alt={fabric.name}
              width={400}
              height={300}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute top-2 right-2">
              {getStockStatus(fabric) === "critical" && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full animate-bounce-in">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Critical
                </span>
              )}
              {getStockStatus(fabric) === "low" && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full animate-bounce-in">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Low
                </span>
              )}
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-medium text-gray-800 truncate">{fabric.name}</h3>
              <span className="text-sm text-gray-600">{fabric.category}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 truncate">{fabric.supplier}</span>
              <span className="text-sm font-medium text-gray-800">${fabric.price.toFixed(2)}/yd</span>
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Stock Level:</span>
                <span
                  className={`font-medium ${
                    getStockStatus(fabric) === "critical"
                      ? "text-red-600"
                      : getStockStatus(fabric) === "low"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {fabric.stockLevel} yards
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full stock-bar ${
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
            <div className="flex space-x-2 md:space-x-3">
              <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs md:text-sm py-2 px-2 md:px-3 rounded-md whitespace-nowrap cursor-pointer transition-colors duration-200 button-pop">
                <i className="fas fa-edit mr-1"></i>
                Update
              </button>
              <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs md:text-sm py-2 px-2 md:px-3 rounded-md whitespace-nowrap cursor-pointer transition-colors duration-200 button-pop">
                <i className="fas fa-shopping-cart mr-1"></i>
                Reorder
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
