"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Fabric } from "@/types/fabric";

interface AddFabricModalProps {
  onClose: () => void;
  onSave: (fabric: Fabric) => void;
  fabrics: Fabric[];
  initialData?: any;
}

export default function AddFabricModal({
  onClose,
  onSave,
  fabrics,
  initialData,
}: AddFabricModalProps) {
  const [newFabric, setNewFabric] = useState<any>({
    name: "",
    category: "",
    supplier: "",
    stockLevel: "",
    minStockLevel: "",
    price: "",
    color: "",
    width: "",
    composition: "",
    imagePrompt: "",
    imageUrl: "",
    id: "preview",
  });

  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use useEffect to set initial data when available
  useEffect(() => {
    if (initialData) {
      // Set image URL based on category if available
      let imageUrl = "";
      if (initialData.Category) {
        const imageNumber = Math.random() > 0.5 ? 1 : 2;
        imageUrl = `/images/fabrics/${initialData.Category.toLowerCase()}-${imageNumber}.png`;
      }

      setNewFabric({
        name: initialData.name || "Unnamed Fabric",
        category: initialData.category || "",
        supplier: initialData.supplier,
        stockLevel: initialData.stockLevel,
        minStockLevel: 5, // Default value
        price: parseFloat(initialData.price).toFixed(2) || 1000,
        // ? parseFloat((initialData.price / 100).toFixed(2))
        // : 15.99, // Convert cents to dollars
        color: initialData.color !== "None" ? initialData.color : "",
        width: initialData.width, // Default value
        composition: initialData.composition,
        imagePrompt: "",
        imageUrl: imageUrl,
        id: "preview",
        lastUpdated: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // If category changes, update the imageUrl
    if (name === "category" && value) {
      const imageNumber = Math.random() > 0.5 ? 1 : 2;
      setNewFabric((prev: any) => ({
        ...prev,
        [name]: value,
        imageUrl: `/images/fabrics/${value.toLowerCase()}-${imageNumber}.png`,
      }));
    } else {
      setNewFabric((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isFormValid = () => {
    // Check only the required fields instead of all fields
    const requiredFields = ["name", "stockLevel", "price"];

    return requiredFields.every((field) => {
      const value = newFabric[field];
      // Check if the value exists and is not empty for strings
      return (
        value !== undefined &&
        value !== null &&
        (typeof value === "string" ? value.trim() !== "" : true)
      );
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);

    const newId = fabrics.length + 1;
    const imageNumber = Math.random() > 0.5 ? 1 : 2;

    const fabricToAdd = {
      ...newFabric,
      id: newId,
      stockLevel: Number.parseInt(newFabric.stockLevel),
      minStockLevel: Number.parseInt(newFabric.minStockLevel),
      price: Number.parseFloat(newFabric.price),
      width: Number.parseInt(newFabric.width),
      lastUpdated: new Date().toISOString().split("T")[0],
      imageUrl:
        newFabric.imageUrl ||
        `/images/fabrics/${newFabric.category.toLowerCase()}-${imageNumber}.png`,
    };

    try {
      // Send data to webhook endpoint
      const response = await fetch(
        "https://n8n-service-sfwl.onrender.com/webhook/df8126ac-732c-47a3-8e98-b73008e56128",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fabricToAdd),
        },
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Continue with the original onSave callback
      onSave(fabricToAdd as Fabric);
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      // Still call onSave even if webhook fails
      onSave(fabricToAdd as Fabric);
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-xl font-semibold text-gray-800">
              Add New Fabric
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 button-pop"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 mb-4">
              {newFabric.imageUrl && (
                <div className="flex justify-center items-center mb-4 animate-fade-in">
                  <div
                    className="relative w-16 h-16 cursor-pointer group hover-scale"
                    onClick={() => setSelectedFabric(newFabric)}
                  >
                    <Image
                      src={newFabric.imageUrl || "/placeholder.svg"}
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
                value={newFabric.name}
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
              <select
                name="category"
                value={newFabric.category}
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
              </select>
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
                value={newFabric.supplier}
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
                value={newFabric.stockLevel}
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
                value={newFabric.minStockLevel}
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
                Price ($/yd)
              </label>
              <input
                type="number"
                name="price"
                value={newFabric.price}
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
                value={newFabric.color}
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
                value={newFabric.width}
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
                value={newFabric.composition}
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

            {isSubmitting ? (
              <button
                disabled={!isFormValid()}
                className={`px-4 py-2 rounded-md whitespace-nowrap text-white duration-200 bg-indigo-300 cursor-not-allowed"
                }`}
              >
                Loading
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`px-4 py-2 rounded-md whitespace-nowrap text-white cursor-pointer transition-all duration-200 button-pop ${
                  isFormValid()
                    ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                    : "bg-indigo-300 cursor-not-allowed"
                }`}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
