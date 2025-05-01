export interface Fabric {
  id: number
  name: string
  category: string
  supplier: string
  stockLevel: number
  minStockLevel: number
  price: number
  color: string
  width: number
  composition: string
  lastUpdated: string
  imagePrompt: string
  imageUrl: string // Added imageUrl field
}
