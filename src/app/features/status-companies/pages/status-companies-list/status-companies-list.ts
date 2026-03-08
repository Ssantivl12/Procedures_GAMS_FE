import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

interface CompanyCard {
  id: string;
  name: string;
  category: string;
  status: string;
  expiry?: string;        
  nro?: string;           
  vigencia?: string;      
  vigenciaColor?: string; 
}

@Component({
  selector: 'app-status-companies-list',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule],
  templateUrl: './status-companies-list.html', 
  styleUrl: './status-companies-list.css'   
})
export class StatusCompaniesListComponent {
  activeTab = 'proceso'; 

  procesoCompanies: CompanyCard[] = [
    { id: '1', name: 'Procesadora de Alimentos Los Andes', category: 'Cat.4', status: 'EN REVISION', expiry: '5 días restantes' },
    { id: '2', name: 'Curtiembre San Martín', category: 'Cat.3', status: 'OBSERVADO PENDIENTE RECOJO' },
    { id: '3', name: 'Fábrica de Muebles El Roble', category: 'Cat.4', status: 'SUBSANACION PENDIENTE REINGRESO' },
    { id: '4', name: 'Metalmecánica Industrial Cochabamba', category: 'Cat.3', status: 'RECIBIDO' }
  ];

  raiCompanies: CompanyCard[] = [
    { id: '5', name: 'Industrias Textiles Sacaba S.R.L.', category: 'Cat.3', nro: 'RAI-2025-001', status: 'CERRADO', vigencia: 'Vigente', vigenciaColor: 'green' },
    { id: '1', name: 'Procesadora de Alimentos Los Andes', category: 'Cat.4', nro: 'RAI-2025-002', status: 'EN REVISION', vigencia: 'N/A', vigenciaColor: 'gray' },
    { id: '2', name: 'Curtiembre San Martín', category: 'Cat.3', nro: 'RAI-2025-003', status: 'OBSERVADO PENDIENTE RECOJO', vigencia: 'N/A', vigenciaColor: 'gray' }
  ];

  maiCompanies: CompanyCard[] = [
    { id: '5', name: 'Industrias Textiles Sacaba S.R.L.', category: 'Cat.3', nro: 'MAI-2025-001', status: 'CERRADO', vigencia: 'Vigente', vigenciaColor: 'green' }
  ];

  get currentCompanies(): CompanyCard[] {
    if (this.activeTab === 'rai') return this.raiCompanies;
    if (this.activeTab === 'mai') return this.maiCompanies;
    return this.procesoCompanies; 
  }
}