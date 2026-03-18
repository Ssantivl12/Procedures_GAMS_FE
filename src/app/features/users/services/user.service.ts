import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../../../api/api-client';
import { Observable, map } from 'rxjs';

/**
 * Interfaz de Usuario sincronizada con el Backend de GAMS.
 * Note: El backend NO maneja 'ci' en este momento.
 */
export interface User {
  id?: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  createdAt?: string;
  lastLoginAt?: string;
  // Campos auxiliares para compatibilidad con el formulario actual
  nombres?: string; 
  apellidos?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = inject(ApiClient);
  private readonly basePath = '/users';

  /**
   * Obtiene la lista de usuarios. 
   * El backend devuelve un Array directo, no un objeto paginado por ahora.
   */
  getUsers(params?: any): Observable<User[]> {
    return this.api.get<any>(this.basePath, params).pipe(
      map(resp => Array.isArray(resp) ? resp : (resp.data || []))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`${this.basePath}/${id}`);
  }

  createUser(data: any): Observable<User> {
    return this.api.post<User>(this.basePath, data);
  }

  updateUser(id: string, data: any): Observable<User> {
    return this.api.patch<User>(`${this.basePath}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
