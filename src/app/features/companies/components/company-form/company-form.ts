import { Component, EventEmitter, Output, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
export class CompanyFormComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  @Output() companyRegistered = new EventEmitter<void>(); 
  @Input() companyToEdit: any = null; 

  private companyService = inject(CompanyService);
  private cdr = inject(ChangeDetectorRef);
  companyForm: FormGroup; 
  submitted = false; 
  isLoading = false; 
  showSuccessModal = false;

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

  ngOnInit() {
    if (this.companyToEdit) {
      const cateMappedBack = this.companyToEdit.category === 'C3' ? 'CATEGORIA 3' : 'CATEGORIA 4';
      
      this.companyForm.patchValue({
        nombres: this.companyToEdit.legalName,
        nit: this.companyToEdit.nit,
        dire: this.companyToEdit.address || '', 
        ciud: this.companyToEdit.municipality || 'SACABA',
        tel: this.companyToEdit.phone || '',
        rep: this.companyToEdit.legalRepName || '',
        cate: cateMappedBack
      });
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.companyForm.invalid) {
      console.warn('Formulario de empresa inválido');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formValue = this.companyForm.value;
    const categoryMapped = formValue.cate === 'CATEGORIA 3' ? 'C3' : (formValue.cate === 'CATEGORIA 4' ? 'C4' : null);

    let phoneFormatted = formValue.tel ? formValue.tel.trim() : '';
    // GAMS Backend seems to expect +591 or specific formats, keeping existing logic
    if (phoneFormatted && !phoneFormatted.startsWith('+591')) {
      phoneFormatted = '+591' + phoneFormatted.replace(/\s/g, '');
    }

    const payload = {
      legalName: formValue.nombres,
      nit: formValue.nit,
      address: formValue.dire,
      municipality: formValue.ciud,
      phone: phoneFormatted || undefined, 
      legalRepName: formValue.rep, 
      category: categoryMapped as 'C3' | 'C4',
      email: this.companyToEdit?.email || 'sin_correo@empresa.com',
      legalRepCi: this.companyToEdit?.legalRepCi || '0000000',
      economicActivity: this.companyToEdit?.economicActivity || 'Actividad no especificada'
    };

    const request = this.companyToEdit 
      ? this.companyService.updateCompany(this.companyToEdit.id, payload)
      : this.companyService.createCompany(payload);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('ERROR GUARDANDO EMPRESA:', err);
        alert('Hubo un error al guardar la empresa. Revisa los datos.');
        this.cdr.detectChanges();
      }
    });
  }

  onFinish() {
    this.companyRegistered.emit(); 
    this.closeForm.emit();
  }
}