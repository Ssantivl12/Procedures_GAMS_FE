import { Component, EventEmitter, Output, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { CompanyService, Company } from '../../services/company.service'; 

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  templateUrl: './company-form.html', 
  styleUrl: './company-form.css'    
})
export class CompanyFormComponent implements OnInit {
  @Output() closeForm = new EventEmitter<void>();
  @Output() companyRegistered = new EventEmitter<void>(); 
  @Input() companyToEdit: Company | null = null; 

  private companyService = inject(CompanyService);
  private cdr = inject(ChangeDetectorRef);
  companyForm: FormGroup; 
  submitted = false; 
  isLoading = false; 
  showSuccessModal = false;
  conflictError: string | null = null;

  caebInput = '';
  caebList: string[] = [];

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      legalName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      nit: ['', [Validators.pattern(/^[0-9]{7,13}$/)]],
      raiNumber: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      category: ['', [Validators.required]],
      address: ['', []],
      municipality: ['Sacaba', [Validators.required]],
      phone: ['', [Validators.pattern(/^\+591[0-9]{8}$/)]], 
      email: ['', [Validators.email]],
      legalRepName: ['', []],
      legalRepCi: ['', []],
      economicActivity: ['', []],
      observations: ['', []]
    });
  }

  get f() { return this.companyForm.controls; }

  ngOnInit() {
    if (this.companyToEdit) {
      this.companyForm.patchValue({
        legalName: this.companyToEdit.legalName,
        nit: this.companyToEdit.nit || '',
        raiNumber: this.companyToEdit.raiNumber || '',
        category: this.companyToEdit.category,
        address: this.companyToEdit.address || '', 
        municipality: this.companyToEdit.municipality || 'Sacaba',
        phone: this.companyToEdit.phone || '',
        email: this.companyToEdit.email || '',
        legalRepName: this.companyToEdit.legalRepName || '',
        legalRepCi: this.companyToEdit.legalRepCi || '',
        economicActivity: this.companyToEdit.economicActivity || '',
        observations: this.companyToEdit.observations || ''
      });
      this.caebList = [...(this.companyToEdit.caebCodes || [])];
    }
  }

  addCaebCode() {
    const code = this.caebInput.trim();
    if (/^[0-9]{5}$/.test(code)) {
      if (this.caebList.length < 10 && !this.caebList.includes(code)) {
        this.caebList.push(code);
        this.caebInput = '';
      }
    }
  }

  removeCaebCode(index: number) {
    this.caebList.splice(index, 1);
  }

  onSubmit() {
    this.submitted = true;
    this.conflictError = null;

    if (this.companyForm.invalid) {
      console.warn('Formulario de empresa inválido');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const formValue = this.companyForm.value;
    const payload: Partial<Company> = {
      ...formValue,
      caebCodes: this.caebList
    };

    // Clean optional empty fields
    Object.keys(payload).forEach(key => {
      if ((payload as any)[key] === '') {
        (payload as any)[key] = undefined;
      }
    });

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
        if (err.status === 409) {
          this.conflictError = 'El número de RAI ya se encuentra registrado por otra empresa.';
        } else {
          alert('Hubo un error al guardar la empresa. Revisa los datos.');
        }
        console.error('ERROR GUARDANDO EMPRESA:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onFinish() {
    this.companyRegistered.emit(); 
    this.closeForm.emit();
  }
}