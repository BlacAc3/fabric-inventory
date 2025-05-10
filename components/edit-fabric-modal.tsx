"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Fabric } from "@/types/fabric";

interface EditFabricModalProps {
  onClose: () => void;
  onSave: (fabric: Fabric) => void;
  fabric: Fabric;
}

export default function EditFabricModal({
  onClose,
  onSave,
  fabric,
}: EditFabricModalProps) {
  const [editedFabric, setEditedFabric] = useState<any>(fabric);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);

  useEffect(() => {
    setEditedFabric(fabric);
  }, [fabric]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // If category changes, update the imageUrl
    if (name === "category" && value) {
      const imageNumber = Math.random() > 0.5 ? 1 : 2;
      setEditedFabric((prev: any) => ({
        ...prev,
        [name]: value,
        imageUrl: `/images/fabrics/${value.toLowerCase()}-${imageNumber}.png`,
      }));
    } else {
      setEditedFabric((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isFormValid = () => {
    return Object.entries(editedFabric).every(([key, value]) => {
      // Skip id, imageUrl and lastUpdated validation
      if (key === "id" || key === "imageUrl" || key === "lastUpdated")
        return true;
      return typeof value === "string" ? value.trim() !== "" : true;
    });
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const fabricToSave = {
      ...editedFabric,
      stockLevel: Number.parseInt(editedFabric.stockLevel),
      minStockLevel: Number.parseInt(editedFabric.minStockLevel),
      price: Number.parseFloat(editedFabric.price),
      width: Number.parseInt(editedFabric.width),
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    // Send POST request to webhook with the updated fabric data
    fetch(
      "https://n8n-service-sfwl.onrender.com/webhook/14961d69-e0b2-40c8-85ff-d96bac69fbb2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fabricToSave),
      },
    )
      .then((response) => {
        if (!response.ok) {
          console.error(
            "Failed to send webhook notification:",
            response.statusText,
          );
        } else {
          console.log("Webhook notification sent successfully");
        }
      })
      .catch((error) => {
        console.error("Error sending webhook notification:", error);
      });
    onSave(fabricToSave as Fabric);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay"
      style={{ zIndex: 50 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 modal-content">
        {selectedFabric && selectedFabric.imageUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] modal-overlay"
            onClick={() => setSelectedFabric(null)}
          >
            <div className="relative w-full max-w-xl max-h-[90vh] animate-scale">
              <Image
                src={selectedFabric.imageUrl || "/placeholder.svg"}
                alt={selectedFabric.name || "Fabric preview"}
                width={800}
                height={800}
                className="object-contain"
              />
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Edit Fabric</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 button-pop"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 mb-4">
              {editedFabric.imageUrl && (
                <div className="flex justify-center items-center mb-4 animate-fade-in">
                  <div
                    className="relative w-16 h-16 cursor-pointer group hover-scale"
                    onClick={() => setSelectedFabric(editedFabric)}
                  >
                    <Image
                      src={editedFabric.imageUrl || "/placeholder.svg"}
                      alt="Fabric preview"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-[20px] shadow-sm group-hover:shadow-md transition-all duration-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-[20px]">
                      <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 text-sm"></i>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editedFabric.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter fabric name"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              {/* <select
                name="category"
                value={editedFabric.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="">Select category</option>
                <option value="Cotton">Cotton</option>
                <option value="Silk">Silk</option>
                <option value="Wool">Wool</option>
                <option value="Linen">Linen</option>
                <option value="Polyester">Polyester</option>
                <option value="Denim">Denim</option>
              </select> */}
              <input
                type="text"
                name="category"
                value={editedFabric.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter category"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={editedFabric.supplier}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter supplier name"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Level
              </label>
              <input
                type="number"
                name="stockLevel"
                value={editedFabric.stockLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter stock level"
                min="0"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.25s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                name="minStockLevel"
                value={editedFabric.minStockLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter minimum stock level"
                min="0"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦/yd)
              </label>
              <input
                type="number"
                name="price"
                value={editedFabric.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter price per yard"
                min="0"
                step="0.01"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.35s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={editedFabric.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter color"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                name="width"
                value={editedFabric.width}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter width"
                min="0"
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.45s" }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Composition
              </label>
              <input
                type="text"
                name="composition"
                value={editedFabric.composition}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Enter composition"
              />
            </div>
          </div>
          <div
            className="flex justify-end space-x-3 mt-6 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md whitespace-nowrap text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200 button-pop"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`px-4 py-2 rounded-md whitespace-nowrap text-white cursor-pointer transition-all duration-200 button-pop ${
                isFormValid()
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                  : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
