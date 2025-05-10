"use client";

import Image from "next/image";
import type { Fabric } from "@/types/fabric";
import { getStockStatus } from "@/lib/utils";

interface FabricListProps {
  fabrics: Fabric[];
  onItemClick: (fabric: Fabric) => void;
  onEditClick: (fabric: Fabric) => void;
}

export default function FabricList({
  fabrics,
  onItemClick,
  onEditClick,
}: FabricListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      {/* Mobile view (card layout) */}
      <div className="block md:hidden">
        {fabrics.map((fabric) => (
          <div
            key={fabric.id}
            onClick={() => onItemClick(fabric)}
            className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 stagger-item"
          >
            <div className="flex items-start space-x-3">
              <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                <Image
                  src={fabric.imageUrl || "/placeholder.svg"}
                  alt={fabric.name}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {fabric.name}
                  </h3>
                  <span className="text-sm font-medium text-gray-900">
                    ${fabric.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{fabric.supplier}</p>
                <div className="mt-2 flex items-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getStockStatus(fabric) === "critical"
                        ? "bg-red-100 text-red-800"
                        : getStockStatus(fabric) === "low"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {fabric.stockLevel} yards
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet and desktop view (table layout) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6"
              >
                Fabric
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
              >
                Details
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6"
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider lg:px-6"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fabrics.map((fabric) => (
              <tr
                key={fabric.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 stagger-item"
                onClick={() => onItemClick(fabric)}
              >
                <td className="px-3 py-4 whitespace-nowrap lg:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative rounded overflow-hidden">
                      <Image
                        src={fabric.imageUrl || "/placeholder.svg"}
                        alt={fabric.name}
                        fill
                        sizes="40px"
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {fabric.name}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap lg:text-sm">
                        {fabric.supplier}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div className="text-sm text-gray-900">{fabric.category}</div>
                  <div className="text-sm text-gray-500">
                    {fabric.composition}, {fabric.width}cm width
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap lg:px-6">
                  <div className="flex flex-col lg:flex-row lg:items-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        getStockStatus(fabric) === "critical"
                          ? "bg-red-100 text-red-800"
                          : getStockStatus(fabric) === "low"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {fabric.stockLevel} yards
                    </span>
                    <div className="mt-1 w-16 lg:w-24 lg:ml-2 bg-gray-200 rounded-full h-1.5">
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
                </td>
                <td className="px-3 py-4 whitespace-nowrap lg:px-6">
                  <div className="text-sm text-gray-900">
                    ₦{fabric.price.toFixed(2)}/yd
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    Updated: {fabric.lastUpdated}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium lg:px-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop event propagation
                      onEditClick(fabric);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer transition-colors duration-200 button-pop"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    <span className="hidden lg:inline">Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
