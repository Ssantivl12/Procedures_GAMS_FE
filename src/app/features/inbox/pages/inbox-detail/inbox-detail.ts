import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-inbox-detail',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule], 
  templateUrl: './inbox-detail.html', 
  styleUrl: './inbox-detail.css'    
})
export class InboxDetailComponent implements OnInit {
  tramiteId: string | null = null;
  
  tramite = {
    id: 'TRA-001', empresa: 'INDUSTRIAS ALIMENTICIAS CORONILLA S.A.', nit: '1016839028',
    tipo: 'Solicitud Licencia Ambiental', fecha: '05/10/2023', estado: 'Por Revisar Inspector',
    inspector: 'Juan Pérez García', certificado_actual: 'LIC-IND-2023-004', ciudad: 'SACABA', 
    fecha_registro: '15/05/1998', direccion: 'Zona Industrial Quintanilla, Km 6.5 Av. Villazón'
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.tramiteId = this.route.snapshot.paramMap.get('id');
  }
}