import type { Fabric } from "@/types/fabric";
import axios from "axios";

export async function getFabricsFromGoogleSheets(): Promise<Fabric[]> {
  try {
    // Set up the n8n webhook URL that triggers Google Sheets integration
    const n8nWebhookUrl =
      "https://n8n-service-sfwl.onrender.com/webhook/55e06422-7756-43a8-8461-60a90595afcf";

    // Make a request to the n8n webhook to get fabric data from Google Sheets
    const response = await axios.get(n8nWebhookUrl);

    // Process the data from Google Sheets into Fabric objects
    const fabricsData = response.data;

    if (!Array.isArray(fabricsData)) {
      console.error("Invalid data format received from n8n webhook");
      return [];
    }

    // Map the received data to our Fabric type
    const fabrics: Fabric[] = fabricsData.map((item: any, index: number) => ({
      id: item.row_number || `fabric-${index + 1}`,
      name: item.Name || `Fabric ${index + 1}`,
      category: item.Category || "Unknown",
      supplier: item.Supplier || "Unknown",
      stockLevel: item.StockInYards ? parseInt(item.StockInYards, 10) : 0,
      minStockLevel: item.minStockLevel ? parseInt(item.minStockLevel, 10) : 15,
      price: item.Price ? parseFloat(item.Price) : 0,
      color: item.Color || "Unknown",
      width: item.width ? parseInt(item.width, 10) : 0,
      composition: item.Material || "Unknown",
      lastUpdated: item.lastUpdated || new Date().toISOString().split("T")[0],
      imageUrl: item.imageUrl || "/images/fabrics/default.png",
      imagePrompt: item.imagePrompt || `High quality fabric texture`,
    }));

    return fabrics;
  } catch (error) {
    console.error("Error fetching fabric data from n8n webhook:", error);
    return [];
  }
}
// Keeping the mock function for fallback or testing purposes
// export function generateMockFabrics(count: number): Fabric[] {
//   const categories = ["Cotton", "Silk", "Wool", "Linen", "Polyester", "Denim"];
//   const suppliers = [
//     "FabricWorld",
//     "TextileMasters",
//     "EcoFabrics",
//     "LuxuryTextiles",
//     "GlobalWeaves",
//   ];
//   const colors = [
//     "Red",
//     "Blue",
//     "Green",
//     "Yellow",
//     "Black",
//     "White",
//     "Purple",
//     "Orange",
//     "Pink",
//     "Gray",
//   ];

//   const mockFabrics: Fabric[] = [];

//   for (let i = 1; i <= count; i++) {
//     const category = categories[Math.floor(Math.random() * categories.length)];
//     const stockLevel = Math.floor(Math.random() * 100);
//     const minStockLevel = 15;
//     const color = colors[Math.floor(Math.random() * colors.length)];
//     const imageNumber = Math.random() > 0.5 ? 1 : 2; // Randomly choose between image 1 or 2 for variety

//     mockFabrics.push({
//       id: i,
//       name: `${category} Fabric ${i}`,
//       category,
//       supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
//       stockLevel,
//       minStockLevel,
//       price: Number.parseFloat((Math.random() * 50 + 10).toFixed(2)),
//       color,
//       width: Math.floor(Math.random() * 100 + 50),
//       composition: `${category} ${Math.floor(Math.random() * 100)}%`,
//       lastUpdated: new Date(
//         Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
//       )
//         .toISOString()
//         .split("T")[0],
//       imageUrl: `/images/fabrics/${category.toLowerCase()}-${imageNumber}.png`,
//       imagePrompt: `High quality ${category.toLowerCase()} fabric texture in ${color.toLowerCase()} color with soft folds and natural lighting on a clean white background showcasing the material weave pattern and texture details for professional fabric inventory display seq=${i} orientation=squarish`,
//     });
//   }

//   return mockFabrics;
// }
