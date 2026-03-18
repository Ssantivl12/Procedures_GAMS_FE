import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Check roles if specified in route data
  const requiredRoles = route.data['roles'] as UserRole[];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!auth.hasRole(requiredRoles)) {
      console.warn('Acceso denegado: Usuario no tiene los roles requeridos:', requiredRoles);
      router.navigate(['/dashboard']); // Or a dedicated unauthorized page
      return false;
    }
  }

  return true;
};
