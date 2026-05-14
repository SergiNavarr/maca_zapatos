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

export interface VarianteDetalleDto {
  id: number;
  talle: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export interface ProductoDetalleDto {
  id: number;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: string;
  precioBase: number;
  imagenUrl?: string;
  variantes: VarianteDetalleDto[];
}

export interface CrearVarianteDto {
    talleId: number;
    colorId: number;
    sku: string;
    stockInicial: number;
}
export interface ProductoMaestroDto {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  precioBase: number;
  imagenUrl?: string;
}

export interface CrearProductoCompletoDto {
    categoriaId: number;
    marcaId: number;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    precioBase: number;
    variantes: CrearVarianteDto[];
}

export const productoService = {
  obtenerProductosParaPOS: async (): Promise<ProductVariant[]> => {
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
  },
  
  crearProductoCompleto: async (productoData: CrearProductoCompletoDto) => {
    return await apiClient<{ mensaje: string, productoId: number }>('/productos', {
      method: 'POST',
      body: JSON.stringify(productoData) // Asumiendo que tu apiClient acepta 'body'
    });
  },

  obtenerProductosMaestros: async (): Promise<ProductoMaestroDto[]> => {
    return await apiClient<ProductoMaestroDto[]>('/productos');
  },

  obtenerDetalle: async (id: number): Promise<ProductoDetalleDto> => {
    return await apiClient<ProductoDetalleDto>(`/productos/${id}`);
  },
}