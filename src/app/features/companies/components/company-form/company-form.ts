import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { CompanyService } from '../../services/company.service'; 

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './company-form.html', 
  styleUrl: './company-form.css'    
})
export class CompanyFormComponent {
  @Output() closeForm = new EventEmitter<void>();
  @Output() companyRegistered = new EventEmitter<void>(); 

  private companyService = inject(CompanyService);
  companyForm: FormGroup; 
  submitted = false; 
  isLoading = false; 

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,-]*$/)]],
      nit: ['', [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(7), Validators.maxLength(13)]],
      dire: ['', [Validators.required]],
      ciud: ['SACABA', [Validators.required]],
      tel: ['', [Validators.pattern(/^\+?[0-9\s]*$/)]], 
      rep: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      cate: ['', [Validators.required]],
    });
  }

  get f() { return this.companyForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.companyForm.invalid) {
      alert('No se puede registrar. Hay campos vacíos o con datos incorrectos. Revisa los mensajes en rojo.');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formValue = this.companyForm.value;
    const categoryMapped = formValue.cate === 'CATEGORIA 3' ? 'C3' : (formValue.cate === 'CATEGORIA 4' ? 'C4' : null);

    let phoneFormatted = formValue.tel ? formValue.tel.trim() : '';
    if (phoneFormatted && !phoneFormatted.startsWith('+591')) {
      phoneFormatted = '+591' + phoneFormatted.replace(/\s/g, '');
    }

    const newCompany = {
      legalName: formValue.nombres,
      nit: formValue.nit,
      address: formValue.dire,
      municipality: formValue.ciud,
      phone: phoneFormatted || undefined, 
      legalRepName: formValue.rep,
      category: categoryMapped as 'C3' | 'C4',
      email: 'sin_correo@empresa.com',
      legalRepCi: '0000000',
      economicActivity: 'Actividad no especificada'
    };

    this.companyService.createCompany(newCompany).subscribe({
      next: () => {
        this.isLoading = false; 
        alert('¡Empresa registrada exitosamente en la base de datos!');
        this.companyRegistered.emit(); 
        this.closeForm.emit(); 
      },
      error: (err: any) => {
        console.error('ERROR DEL BACKEND:', err);
        alert('El servidor rechazó los datos. Revisa la consola para más detalles.');
        this.isLoading = false;
      }
    });
  }
}