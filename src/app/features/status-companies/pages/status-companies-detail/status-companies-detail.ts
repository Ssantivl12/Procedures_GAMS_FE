import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { DashboardHeaderComponent } from '../../../dashboard/components/dashboard-header/dashboard-header';

@Component({
  selector: 'app-status-companies-detail',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent],
  templateUrl: './status-companies-detail.html',
  styleUrl: './status-companies-detail.css'
})
export class StatusCompaniesDetailComponent implements OnInit {
  companyId: string | null = null;

  company = {
    name: 'Industrias Textiles Sacaba S.R.L.',
    category: 'Cat.3',
    inspector: 'Carlos Pérez',
    vigenciaRai: 'Vigente (1735 días)',
    vigenciaRaiColor: 'green',
    vigenciaMai: 'Vigente (3580 días)',
    vigenciaMaiColor: 'green',
    estadoIaa: 'Pendiente',
    estadoIaaColor: 'yellow'
  };

  tramites = [
    {
      tipo: 'RAI - Registro Ambiental Industrial',
      estado: 'CERRADO',
      estadoColor: 'green',
      recibido: '9/9/2025',
      inicioComputo: '14/9/2025',
      nroCertificado: 'RAI-2025-001',
      cerrado: '9/10/2025'
    },
    {
      tipo: 'MAI/PMA - Manifiesto Ambiental Industrial',
      estado: 'CERRADO',
      estadoColor: 'green',
      recibido: '29/9/2025',
      inicioComputo: '-',
      nroCertificado: 'MAI-2025-001',
      cerrado: '-'
    },
    {
      tipo: 'IAA - Informe Ambiental Anual (Gestión 2025)',
      estado: 'CERRADO',
      estadoColor: 'green',
      recibido: '-',
      inicioComputo: '-',
      nroCertificado: '-',
      cerrado: '-'
    }
  ];

  constructor(private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
  }

  goBack(): void {
    this.location.back();
  }
}