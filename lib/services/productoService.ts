import { apiClient } from '@/lib/api'
import type { ProductVariant } from '@/types/pos'

interface ProductoParaVentaDto {
  varianteId: number;
  nombre: string;
  marca: string;
  categoria: string;
  talle: string;
  color: string;
  precio: number;
  stock: number;
  imagen?: string;
}

export const productoService = {
  obtenerProductosParaPOS: async (): Promise<ProductVariant[]> => {
    // Buscamos los datos en la API
    const data = await apiClient<ProductoParaVentaDto[]>('/productos/pos');
    
    return data.map(item => ({
      id: item.varianteId.toString(), 
      name: item.nombre,
      brand: item.marca,
      category: item.categoria,
      size: item.talle,
      color: item.color,
      price: item.precio,
      quantity: item.stock,
      image: item.imagen || undefined
    }));
  }
}