import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; 
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule],
  templateUrl: './company-detail.html', 
  styleUrl: './company-detail.css'    
})
export class CompanyDetailComponent implements OnInit {
  companyId: string | null = null;
  
  company = {
    id: '1', name: 'INDUSTRIAS ALIMENTICIAS CORONILLA S.A.', nit: '1016839028',
    cate: '3', subCate: 'Elaboración de galletas', sub: '9 de 10', vigencia: '23/04/2026',
    estado: 'Vigente', lic: 'LIC-IND-2023-004', fec: '15/05/1998', ciud: 'SACABA', dire: 'Zona Industrial Quintanilla, Km 6.5 Av. Villazón', 
    tel: '4712345', rep: 'Juan Pérez García'
  };


  activeTab = 'general'; 

  personal = [
    { name: 'María', lastName: 'González', ci: '12345678', email: 'maria.gonzalez@gams.gob.bo', role: 'Inspector', status: 'Activo' },
    { name: 'Carlos', lastName: 'Pérez', ci: '87654321', email: 'carlos.inspector@gams.gob.bo', role: 'Inspector', status: 'Activo' },
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
  }
}
