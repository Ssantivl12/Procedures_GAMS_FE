import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';
import { UserFormComponent } from '../../components/user-form/user-form';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, UserFormComponent],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersListComponent {
  isModalOpen = false;
  users = [
    { name: 'María', lastName: 'González', ci: '12345678', email: 'maria.gonzalez@gams.gob.bo', role: 'Secretaría', status: 'Activo' },
    { name: 'Carlos', lastName: 'Pérez', ci: '87654321', email: 'carlos.inspector@gams.gob.bo', role: 'Inspector', status: 'Activo' },
    { name: 'Ana', lastName: 'Rodríguez', ci: '11223344', email: 'ana.super@gams.gob.bo', role: 'SuperAdmin', status: 'Activo' },
    { name: 'Juan', lastName: 'Mamani', ci: '55667788', email: 'juan.inspector@gams.gob.bo', role: 'Inspector', status: 'Activo' },
    { name: 'Rosa', lastName: 'Quispe', ci: '99887766', email: 'rosa.secretaria@gams.gob.bo', role: 'Secretaría', status: 'Inactivo' },
  ];
}
