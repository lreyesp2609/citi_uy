/**
 * Cliente API centralizado para todas las peticiones HTTP
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Método principal para hacer peticiones
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options;

    // Construir URL con parámetros de query si existen
    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    // Configuración por defecto
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include', // Importante para cookies
      ...fetchOptions,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Si la respuesta no es ok, lanzar error
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error en la petición',
          error: data.error,
          errors: data.errors,
        };
      }

      return data;
    } catch (error: any) {
      console.error('Error en petición API:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: error.message,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Exportar instancia única del cliente
export const apiClient = new ApiClient();

// También exportar la clase por si necesitas crear instancias personalizadas
export default ApiClient;