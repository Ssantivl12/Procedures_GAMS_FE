import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
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

  @Input() userToEdit: User | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<void>();

  userForm: FormGroup;
  currentStep = 1;
  totalSteps = 2;
  isLoading = false;
  submitted = false;
  showSuccessModal = false;

  stepConfig = [
    { title: 'Datos Personales', description: 'Información básica del funcionario' },
    { title: 'Acceso y Rol', description: 'Credenciales y permisos en el sistema' }
  ];

  constructor() {
    this.userForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)]],
      ci: ['', [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(7), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rol: ['', [Validators.required]],
      status: ['Activo', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.userToEdit) {
      // Mapear fullName de vuelta a nombres/apellidos si es posible para el formulario
      const nameParts = this.userToEdit.fullName.split(' ');
      const nombres = nameParts[0] || '';
      const apellidos = nameParts.slice(1).join(' ') || '';
      
      this.userForm.patchValue({
        nombres,
        apellidos,
        correo: this.userToEdit.email,
        rol: this.userToEdit.roles[0] || '',
        status: this.userToEdit.isActive ? 'Activo' : 'Inactivo'
      });
      
      this.f['password'].setValidators([Validators.minLength(8)]);
      this.f['password'].updateValueAndValidity();
    }
  }

  get f() { return this.userForm.controls; }

  nextStep() {
    this.submitted = true;
    if (this.isStepValid(1)) {
      this.currentStep = 2;
      this.submitted = false;
    } else {
      const invalidFields: string[] = [];
      if (this.f['nombres'].invalid) invalidFields.push('Nombres');
      if (this.f['apellidos'].invalid) invalidFields.push('Apellidos');
      if (this.f['ci'].invalid) invalidFields.push('CI (debe tener entre 7 y 10 dígitos)');
      
      alert('Por favor complete los campos requeridos correctamente:\n- ' + invalidFields.join('\n- '));
    }
  }

  prevStep() {
    this.currentStep = 1;
  }

  isStepValid(step: number): boolean {
    if (step === 1) {
      return this.f['nombres'].valid && this.f['apellidos'].valid && this.f['ci'].valid;
    }
    // Step 2 includes email, password (if new), and role
    return this.f['correo'].valid && this.f['rol'].valid && (this.userToEdit ? true : this.f['password'].valid);
  }

  onSubmit() {
    console.log('Tentativa de envío de formulario...');
    this.submitted = true;
    if (this.userForm.invalid) {
      console.warn('Formulario inválido:', this.userForm.value);
      const invalidFields: string[] = [];
      Object.keys(this.userForm.controls).forEach(key => {
        if (this.userForm.get(key)?.invalid) {
          invalidFields.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
      });
      alert('El formulario tiene errores en los siguientes campos:\n- ' + invalidFields.join('\n- '));
      return;
    }

    this.isLoading = true;
    const formVals = this.userForm.value;
    
    // Map to Backend DTO: CreateUserDto { email, password, fullName, roles: UserRole[] }
    const userData: any = {
      email: formVals.correo,
      fullName: `${formVals.nombres} ${formVals.apellidos}`.trim(),
      roles: [formVals.rol] // Backend expects an array
    };

    if (formVals.password) {
      userData.password = formVals.password;
    }

    const request = this.userToEdit 
      ? this.userService.updateUser(this.userToEdit.id!, userData)
      : this.userService.createUser(userData);

    request.subscribe({
      next: (resp) => {
        console.log('Operación exitosa:', resp);
        this.isLoading = false; // Detener carga inmediatamente
        this.showSuccessModal = true;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error detallado al guardar usuario:', err);
        const errorMsg = err.error?.message 
          ? (Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message)
          : 'Error de conexión con el servidor';
        alert('Error al guardar: ' + errorMsg);
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