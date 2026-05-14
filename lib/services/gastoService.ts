import { apiClient } from '../api';

export interface GastoDto {
  id: number;
  concepto: string;
  monto: number;
  fechaCreacion: string;
  nombreUsuario: string;
}

export interface CrearGastoDto {
  concepto: string;
  monto: number;
}

export const gastoService = {
  obtenerGastosMes: async (mes: number, anio: number): Promise<GastoDto[]> => {
    return await apiClient<GastoDto[]>(`/gastos?mes=${mes}&anio=${anio}`);
  },
  
  crearGasto: async (dto: CrearGastoDto): Promise<void> => {
    return await apiClient('/gastos', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }
};