import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Fabric } from "@/types/fabric"

export function getStockStatus(fabric: Fabric) {
  if (fabric.stockLevel <= fabric.minStockLevel / 2) return "critical"
  if (fabric.stockLevel <= fabric.minStockLevel) return "low"
  return "healthy"
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
