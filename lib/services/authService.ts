import { apiClient } from '@/lib/api'

export interface LoginRequestDto {
  nombreUsuario: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  nombreUsuario: string;
  rol: string;
}

export const authService = {
  login: async (credentials: LoginRequestDto) => {
    return await apiClient<LoginResponseDto>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
}