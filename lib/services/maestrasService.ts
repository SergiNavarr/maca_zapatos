import { apiClient } from '@/lib/api'

export interface CategoriaDto {
  id: number;
  nombre: string;
}

export interface MarcaDto {
  id: number;
  nombre: string;
}

export interface ColorDto {
  id: number;
  nombre: string;
  codigoHex?: string;
}

export interface TalleDto {
  id: number;
  valor: string;
  categoriaId: number;
  categoriaNombre: string;
}

export const maestrasService = {
  obtenerCategorias: async (): Promise<CategoriaDto[]> => {
    return await apiClient<CategoriaDto[]>('/categorias');
  },

  obtenerMarcas: async (): Promise<MarcaDto[]> => {
    return await apiClient<MarcaDto[]>('/marcas');
  },

  obtenerColores: async (): Promise<ColorDto[]> => {
    return await apiClient<ColorDto[]>('/colores');
  },

  obtenerTallesPorCategoria: async (categoriaId: number): Promise<TalleDto[]> => {
    return await apiClient<TalleDto[]>(`/talles/categoria/${categoriaId}`);
  }
}