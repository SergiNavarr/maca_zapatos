import { apiClient } from '../api' // Asegurate de ajustar esta ruta

export const uploadService = {
  subirImagen: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('archivo', file);
    
    const respuesta = await apiClient<{ url: string }>('/uploads', {
      method: 'POST',
      body: formData,
    });

    return respuesta.url;
  }
};