import { apiClient } from '@/lib/api'
import type { CartItem, PaymentMethod } from '@/types/pos'

// Estas interfaces coinciden exactamente con los DTOs que armaste en C#
export interface CrearDetalleVentaDto {
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CrearVentaDto {
  metodoPago: number;
  montoTotal: number;
  detalles: CrearDetalleVentaDto[];
}

// Función auxiliar para mapear el string de React al Enum de C#
const mapearMetodoPago = (metodo: PaymentMethod | 'mixto' | null): number => {
  switch (metodo) {
    case 'efectivo': return 1;
    case 'tarjeta': return 2;
    case 'transferencia': return 3;
    case 'mixto': return 4;
    default: return 1; // Por defecto efectivo si algo falla
  }
}

export const ventaService = {
  registrarVenta: async (cart: CartItem[], total: number, paymentMethod: PaymentMethod | 'mixto' | null) => {
    
    // Armamos el "paquete" (DTO) para enviarlo a .NET
    const payload: CrearVentaDto = {
      metodoPago: mapearMetodoPago(paymentMethod),
      montoTotal: total,
      detalles: cart.map(item => ({
        varianteId: parseInt(item.id), // C# espera un entero, pero en el frontend el id es string
        cantidad: item.cartQuantity,
        precioUnitario: item.price
      }))
    };

    // Hacemos el POST
    return await apiClient<{ mensaje: string, ventaId: number }>('/Ventas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}