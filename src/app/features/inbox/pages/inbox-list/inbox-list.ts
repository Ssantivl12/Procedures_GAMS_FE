import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-inbox-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule], 
  templateUrl: './inbox-list.html', 
  styleUrl: './inbox-list.css'    
})
export class InboxListComponent {
  pendingItems = [
    { id: 'TRA-001', empresa: 'INDUSTRIAS ALIMENTICIAS CORONILLA S.A.', tramite: 'Solicitud Licencia Ambiental', fecha: '05/10/2023', estado: 'Por Revisar Inspector', dias: 2 },
    { id: 'TRA-002', empresa: 'COOPERATIVA DE TRANSPORTE Y TURISMO S.R.L.', tramite: 'Renovación de Certificado', fecha: '03/10/2023', estado: 'Subsanación Pendiente', dias: 4 },
    { id: 'TRA-003', empresa: 'EMPRESA CONSTRUCTORA Y DE SERVICIOS', tramite: 'Solicitud Permiso Descarga', fecha: '01/10/2023', estado: 'Por Revisar Inspector', dias: 6 },
    { id: 'TRA-004', empresa: 'PHARMACOSMÉDICA ANDINA S.A.', tramite: 'Solicitud Licencia Ambiental', fecha: '28/09/2023', estado: 'Subsanación Pendiente', dias: 9 },
    { id: 'TRA-005', empresa: 'GESTIÓN INTEGRAL DE RESIDUOS', tramite: 'Renovación de Certificado', fecha: '25/09/2023', estado: 'Observado', dias: 12 },
  ];
}