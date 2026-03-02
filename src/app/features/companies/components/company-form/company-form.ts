import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 

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

  companyForm: FormGroup; 
  submitted = false; 

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      nit: ['', [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(10), Validators.maxLength(12)]],
      dire: ['', [Validators.required]],
      ciud: ['SACABA', [Validators.required]],
      tel: ['', [Validators.pattern(/^[0-9]*$/)]], 
      rep: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      cate: ['', [Validators.required]],
    });
  }

  get f() { return this.companyForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.companyForm.invalid) {
      return;
    }

    console.log('¡Empresa válida!', this.companyForm.value);

    alert('¡Empresa registrada correctamente!');
    this.companyRegistered.emit(); 
    this.closeForm.emit(); 
  }
}