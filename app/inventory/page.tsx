"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import SearchFilterBar from "@/components/search-filter-bar";
import StatsOverview from "@/components/stats-overview";
import FabricGrid from "@/components/fabric-grid";
import FabricList from "@/components/fabric-list";
import AddFabricModal from "@/components/add-fabric-modal";
import DetailModal from "@/components/detail-modal";
import Footer from "@/components/footer";
import LoadingSpinner from "@/components/loading-spinner";
import type { Fabric } from "@/types/fabric";
// import { generateMockFabrics } from "@/lib/mock-data"
import { getFabricsFromGoogleSheets } from "@/lib/mock-data";
import { useMediaQuery } from "@/hooks/use-media-query";
import EditFabricModal from "@/components/edit-fabric-modal";

export default function InventoryPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [filteredFabrics, setFilteredFabrics] = useState<Fabric[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [cardSize, setCardSize] = useState<"S" | "M" | "L">("M");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "low" | "critical" | "healthy"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  // Set view mode based on screen size
  useEffect(() => {
    if (isTablet) {
      setCardSize("M");
    }
  }, [isTablet]);

  // Fetch data
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Simulate loading delay
    const fetchData = async () => {
      try {
        const mockFabrics = await getFabricsFromGoogleSheets();

        // Check if the response is valid
        if (
          !mockFabrics ||
          !Array.isArray(mockFabrics) ||
          mockFabrics.length === 0
        ) {
          setError("No fabric data available. Please try again later.");
          setFabrics([]);
          setFilteredFabrics([]);
        } else {
          setFabrics(mockFabrics);
          setFilteredFabrics(mockFabrics);
        }
      } catch (err) {
        console.error("Failed to fetch fabric data:", err);
        setError("Failed to load fabric data. Please try again later.");
        setFabrics([]);
        setFilteredFabrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      fetchData();
    }, 800);
  }, []);

  // Filter fabrics based on search term and active filter
  useEffect(() => {
    let result = fabrics;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (fabric) =>
          fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fabric.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fabric.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply stock level filter
    if (activeFilter === "low") {
      result = result.filter(
        (fabric) =>
          fabric.stockLevel <= fabric.minStockLevel &&
          fabric.stockLevel > fabric.minStockLevel / 2,
      );
    } else if (activeFilter === "critical") {
      result = result.filter(
        (fabric) => fabric.stockLevel <= fabric.minStockLevel / 2,
      );
    } else if (activeFilter === "healthy") {
      result = result.filter(
        (fabric) => fabric.stockLevel > fabric.minStockLevel,
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((fabric) => fabric.category === categoryFilter);
    }

    setFilteredFabrics(result);
  }, [searchTerm, activeFilter, categoryFilter, fabrics]);

  // Get all unique categories
  const categories = Array.from(
    new Set(fabrics.map((fabric) => fabric.category)),
  );

  const handleItemClick = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setIsDetailModalOpen(true);
  };

  const handleAddFabric = (newFabric: Fabric) => {
    setFabrics((prev) => [...prev, newFabric]);
    setFilteredFabrics((prev) => [...prev, newFabric]);
    setIsModalOpen(false);
  };

  const handleEditFabric = (updatedFabric: Fabric) => {
    setFabrics((prev) =>
      prev.map((fabric) =>
        fabric.id === updatedFabric.id ? updatedFabric : fabric,
      ),
    );
    setIsEditModalOpen(false);
    setSelectedFabric(null);
  };

  const handleEditClick = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setIsEditModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("all");
    setCategoryFilter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddNewClick={() => setIsModalOpen(true)}
        currentPage="inventory"
      />

      <SearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
        <StatsOverview
          fabrics={fabrics}
          setActiveFilter={setActiveFilter}
          setCategoryFilter={setCategoryFilter}
        />

        {/* Results Summary */}
        <div
          className="mb-6 flex justify-between items-center animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-lg font-medium text-gray-700">
            {filteredFabrics.length}{" "}
            {filteredFabrics.length === 1 ? "fabric" : "fabrics"} found
            {activeFilter !== "all" &&
              ` (${activeFilter === "low" ? "Low" : activeFilter === "critical" ? "Critical" : "Healthy"} Stock)`}
            {categoryFilter && ` in ${categoryFilter}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </h2>
          {filteredFabrics.length === 0 && !error && !isLoading && (
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer transition-colors duration-200 button-pop"
            >
              <i className="fas fa-times mr-1"></i>
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Data Unavailable
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 cursor-pointer transition-colors duration-200 button-pop"
            >
              <i className="fas fa-redo mr-2"></i>
              Refresh Page
            </button>
          </div>
        ) : filteredFabrics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-fade-in">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-search text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No fabrics found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 cursor-pointer transition-colors duration-200 button-pop"
            >
              <i className="fas fa-redo mr-2"></i>
              Reset all filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <FabricGrid
            fabrics={filteredFabrics}
            cardSize={cardSize}
            onItemClick={handleItemClick}
          />
        ) : (
          <FabricList
            fabrics={filteredFabrics}
            onItemClick={handleItemClick}
            onEditClick={handleEditClick}
          />
        )}

        {/* Quick scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg cursor-pointer transition-all duration-200 button-pop hover:shadow-xl"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </main>

      <Footer />

      {isModalOpen && (
        <AddFabricModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddFabric}
          fabrics={fabrics}
        />
      )}

      {isDetailModalOpen && selectedFabric && (
        <DetailModal
          fabric={selectedFabric}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedFabric(null);
          }}
        />
      )}

      {isEditModalOpen && selectedFabric && (
        <EditFabricModal
          fabric={selectedFabric}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFabric(null);
          }}
          onSave={handleEditFabric}
        />
      )}
    </div>
  );
}
