import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  @Input() userToEdit: User | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<void>();

  userForm: FormGroup;
  isLoading = false;
  submitted = false;
  showSuccessModal = false;
  errorMessage: string | null = null;

  constructor() {
    this.userForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rol: ['', [Validators.required]],
      status: ['Activo', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.userToEdit) {
      // Cargar nombres/apellidos directos del usuario
      this.userForm.patchValue({
        nombres: this.userToEdit.firstName || '',
        apellidos: this.userToEdit.lastName || '',
        correo: this.userToEdit.email || '',
        rol: (this.userToEdit.roles && this.userToEdit.roles.length > 0) ? this.userToEdit.roles[0] : '',
        status: this.userToEdit.isActive ? 'Activo' : 'Inactivo'
      });
      
      this.f['password'].setValidators([Validators.minLength(8)]);
      this.f['password'].updateValueAndValidity();
    }
  }

  get f() { return this.userForm.controls; }

  onSubmit() {
    console.log('--- Action Clicked: SUBMIT form ---');
    console.log('Form Values:', this.userForm.value);
    
    this.submitted = true;
    this.errorMessage = null;

    if (this.userForm.invalid) {
      console.log('Form is INVALID!');
      Object.keys(this.userForm.controls).forEach(key => {
        const controlErrors = this.userForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log(`Control [${key}] is invalid:`, controlErrors);
        }
      });
      this.errorMessage = 'Por favor complete correctamente todos los campos obligatorios.';
      this.cdr.detectChanges();
      return;
    }

    console.log('Form is VALID. Processing payload...');
    this.isLoading = true;
    this.cdr.detectChanges();
    const formVals = this.userForm.value;
    
    // Map to Backend DTO: CreateUserDto { email, password, firstName, lastName, roles: UserRole[] }
    // En edición, password es opcional normalmente
    const mappedData: any = {
      email: formVals.correo,
      firstName: formVals.nombres.trim(),
      lastName: formVals.apellidos.trim(),
      roles: [formVals.rol] // Backend expects an array
      // Solo enviamos el password en creación o si realmente lo escribió (para actualización futura)
    };

    if (formVals.password) {
      mappedData.password = formVals.password;
    }

    const request = this.userToEdit 
      ? this.userService.updateUser(this.userToEdit.id!, mappedData)
      : this.userService.createUser(mappedData);

    request.subscribe({
      next: (resp) => {
        console.log('Operación exitosa:', resp);
        this.isLoading = false; // Detener carga inmediatamente
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error detallado al guardar usuario:', err);
        // err is an AppError object from errorInterceptor, so the backend response is in err.details
        const backendError = err.details?.message || err.message;
        const errorMsg = Array.isArray(backendError) ? backendError.join(', ') : backendError;
        
        this.errorMessage = 'Aviso: ' + errorMsg;
        this.cdr.detectChanges();
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  finishAndClose() {
    this.userSaved.emit();
    this.closeForm.emit();
  }
}