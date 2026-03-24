import {
  Component, EventEmitter, Output, Input,
  OnInit, inject, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, AbstractControl,
  ReactiveFormsModule, FormsModule, ValidationErrors,
} from '@angular/forms';
import {
  CompanyService, Company, RawMaterial, FinalProduct,
} from '../../services/company.service';
import { showToast } from '../../../../shared/utils/toast.utils';

// ── Constants ──────────────────────────────────────────────────────────────────

export const DISTRICTS = [
  'DISTRITO 1',
  'DISTRITO 2',
  'DISTRITO 3',
  'DISTRITO 4',
  'DISTRITO 5',
  'DISTRITO 6',
  'DISTRITO 7',
  'DISTRITO LAVA LAVA',
  'DISTRITO CHIÑATA',
] as const;

export const GEO_ZONES = ['Urbano', 'Rural'] as const;

export const UTM_ZONES = ['19K', '20K'] as const;

export const EFFLUENT_DISPOSAL_OPTIONS = [
  'PTAR',
  'PTAR+ALCANTARILLADO',
  'ALCANTARILLADO COOPERATIVA',
  'POZO SEPTICO',
  'OTRO',
] as const;

export const SOLID_WASTE_DISPOSAL_OPTIONS = [
  'GERES',
  'TERCIARIZACIÓN',
  'GERES+TERCIARIZACIÓN',
  'OTRO',
] as const;

export const WATER_SUPPLY_OPTIONS = [
  'POZO DE AGUA',
  'RED DE AGUA (COOPERATIVA)',
  'CISTERNA',
  'EMAPAS',
  'POZO+COOPERATIVA',
  'OTROS',
] as const;

// ── Custom validators ──────────────────────────────────────────────────────────

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value || '';
  if (!val) return null; // optional
  // only digits and commas
  if (!/^[\d,\s]+$/.test(val)) {
    return { phoneInvalid: true };
  }
  return null;
}

function coordinatesValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = (control.value || '').trim();
  if (!val) return { required: true };
  // Accept common coordinate formats: decimal or DMS
  // Decimal: -17.12345, -66.54321  or  17.12345 S 66.54321 W
  // DMS: 17°23'45''S  66°09'12''W  or variants
  const decimalPattern = /^-?\d{1,3}(\.\d+)?[,\s]+-?\d{1,3}(\.\d+)?$/;
  const dmsPattern = /\d+[°º]\s*\d+[''′]\s*\d+[""″'']\s*[NSns]/i;
  if (decimalPattern.test(val) || dmsPattern.test(val)) return null;
  // Allow any non-empty value containing a digit (loose fallback)
  if (/\d/.test(val)) return null;
  return { coordinatesInvalid: true };
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './company-form.html',
  styleUrl:    './company-form.css',
})
export class CompanyFormComponent implements OnInit {
  @Output() closeForm         = new EventEmitter<void>();
  @Output() companyRegistered = new EventEmitter<void>();
  @Input()  companyToEdit: Company | null = null;

  private companyService = inject(CompanyService);
  private cdr            = inject(ChangeDetectorRef);
  private fb             = inject(FormBuilder);

  // Select options
  readonly districts               = DISTRICTS;
  readonly geoZones                = GEO_ZONES;
  readonly utmZones                = UTM_ZONES;
  readonly effluentDisposalOptions = EFFLUENT_DISPOSAL_OPTIONS;
  readonly solidWasteOptions       = SOLID_WASTE_DISPOSAL_OPTIONS;
  readonly waterSupplyOptions      = WATER_SUPPLY_OPTIONS;

  // Step state
  currentStep = 1;
  readonly totalSteps = 4;
  readonly steps = [
    { number: 1, label: 'Identificación' },
    { number: 2, label: 'Ubicación'      },
    { number: 3, label: 'Residuos'       },
    { number: 4, label: 'Producción'     },
  ];

  // Form state
  submitted     = false;
  isLoading     = false;
  showSuccess   = false;
  conflictError: string | null = null;

  // Dynamic lists
  caebInput   = '';
  caebList:   string[]      = [];
  caebError   = '';

  rawMaterials: RawMaterial[]  = [];
  rmName = ''; rmQty = '';

  finalProducts: FinalProduct[] = [];
  fpName = ''; fpQty = ''; fpUnit = '';

  // Reactive form
  form!: FormGroup;

  ngOnInit() {
    this.buildForm();
    if (this.companyToEdit) this.patchForm(this.companyToEdit);
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  private buildForm() {
    this.form = this.fb.group({
      // Step 1 — Identificación
      legalName:     ['', [Validators.required, Validators.minLength(1)]],
      nit:           ['', [Validators.pattern(/^\d{7,13}$/)]],
      raiNumber:     ['', [Validators.pattern(/^\d{9}$/)]],
      category:      ['', [Validators.required]],
      businessClass: [''],
      legalRepName:  [''],
      legalRepCi:    ['', [Validators.pattern(/^[a-zA-Z0-9]*$/)]],
      phone:         ['', [phoneValidator]],
      email:         ['', [Validators.email]],
      observations:  [''],

      // Step 2 — Ubicación
      municipality:  [''],
      address:       [''],
      district:      ['', [Validators.required]],
      geoZone:       ['', [Validators.required]],
      coordinates:   ['', [coordinatesValidator]],
      utmZone:       [''],

      // Step 3 — Residuos y sustancias
      effluentDisposal:              [''],
      solidWasteDisposal:            [''],
      useHazardousSubstances:        [null],
      hazardousSubstancesDescription:[''],
      usesMercury:                   [null],

      // Step 4 — Producción y agua
      economicActivity: [''],
      usedArea:         [null],
      areaUnit:         [''],
      waterSupply:      [''],
      installedPower:   [null],
    });

    // Conditional validator: hazardousSubstancesDescription required when useHazardousSubstances = true
    this.form.get('useHazardousSubstances')?.valueChanges.subscribe(val => {
      const desc = this.form.get('hazardousSubstancesDescription')!;
      if (val === true) {
        desc.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        desc.clearValidators();
      }
      desc.updateValueAndValidity();
    });
  }

  private patchForm(c: Company) {
    this.form.patchValue({
      legalName:     c.legalName,
      nit:           c.nit           || '',
      raiNumber:     c.raiNumber     || '',
      category:      c.category,
      businessClass: c.businessClass || '',
      legalRepName:  c.legalRepName  || '',
      legalRepCi:    c.legalRepCi    || '',
      phone:         c.phone         || '',
      email:         c.email         || '',
      observations:  c.observations  || '',
      municipality:  c.municipality  || '',
      address:       c.address       || '',
      district:      c.district      || '',
      geoZone:       c.geoZone       || '',
      coordinates:   c.coordinates   || '',
      utmZone:       c.utmZone       || '',
      effluentDisposal:              c.effluentDisposal              || '',
      solidWasteDisposal:            c.solidWasteDisposal            || '',
      useHazardousSubstances:        c.useHazardousSubstances        ?? null,
      hazardousSubstancesDescription:c.hazardousSubstancesDescription|| '',
      usesMercury:                   c.usesMercury                   ?? null,
      economicActivity: c.economicActivity || '',
      usedArea:         c.usedArea         ?? null,
      areaUnit:         c.areaUnit         || '',
      waterSupply:      c.waterSupply      || '',
      installedPower:   c.installedPower   ?? null,
    });
    this.caebList     = [...(c.caebCodes    || [])];
    this.rawMaterials  = [...(c.rawMaterials  || [])];
    this.finalProducts = [...(c.finalProducts || [])];
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  get f() { return this.form.controls; }

  get usesHazardous(): boolean {
    return this.form.get('useHazardousSubstances')?.value === true;
  }

  /** Returns true if the field should show error styling */
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || this.submitted));
  }

  /** Returns true for CAEB section error */
  get caebInvalid(): boolean {
    return this.submitted && this.caebList.length === 0;
  }

  // ── Step navigation ────────────────────────────────────────────────────────

  nextStep() {
    if (this.validateStep(this.currentStep) && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(n: number) {
    if (n < this.currentStep) {
      this.currentStep = n;
      return;
    }
    for (let s = this.currentStep; s < n; s++) {
      if (!this.validateStep(s)) return;
      this.currentStep = s + 1;
    }
  }

  private validateStep(step: number): boolean {
    const required: Record<number, string[]> = {
      1: ['legalName', 'category'],
      2: ['district', 'geoZone', 'coordinates'],
      3: [],
      4: [],
    };

    // Step 1 also needs at least one CAEB
    if (step === 1 && this.caebList.length === 0) {
      this.submitted = true;
      (required[1] || []).forEach(k => this.form.get(k)?.markAsTouched());
      return false;
    }

    let valid = true;
    (required[step] || []).forEach(key => {
      const ctrl = this.form.get(key);
      if (ctrl) {
        ctrl.markAsTouched();
        if (ctrl.invalid) valid = false;
      }
    });

    // Step 3: hazardousSubstancesDescription when applicable
    if (step === 3 && this.usesHazardous) {
      const desc = this.form.get('hazardousSubstancesDescription');
      desc?.markAsTouched();
      if (desc?.invalid) valid = false;
    }

    return valid;
  }

  isStepValid(step: number): boolean {
    const required: Record<number, string[]> = {
      1: ['legalName', 'category'],
      2: ['district', 'geoZone', 'coordinates'],
      3: [],
      4: [],
    };
    const caebOk = step !== 1 || this.caebList.length > 0;
    return caebOk && (required[step] || []).every(key => this.form.get(key)?.valid);
  }

  // ── Dynamic lists — CAEB ───────────────────────────────────────────────────

  addCaeb() {
    const code = this.caebInput.trim();
    this.caebError = '';

    if (!/^\d+$/.test(code)) {
      this.caebError = 'Solo se permiten números.';
      return;
    }
    if (code.length < 5) {
      this.caebError = 'Mínimo 5 dígitos.';
      return;
    }
    if (code.length > 10) {
      this.caebError = 'Máximo 10 dígitos.';
      return;
    }
    if (this.caebList.includes(code)) {
      this.caebError = 'Este código ya fue agregado.';
      return;
    }
    if (this.caebList.length >= 10) {
      this.caebError = 'Máximo 10 códigos.';
      return;
    }

    this.caebList.push(code);
    this.caebInput = '';
  }

  removeCaeb(i: number) { this.caebList.splice(i, 1); }

  // ── Dynamic lists — Raw Materials ──────────────────────────────────────────

  addRawMaterial() {
    if (this.rmName.trim()) {
      this.rawMaterials.push({ name: this.rmName.trim(), quantity: this.rmQty.trim() || '' });
      this.rmName = ''; this.rmQty = '';
    }
  }

  removeRawMaterial(i: number) { this.rawMaterials.splice(i, 1); }

  // ── Dynamic lists — Final Products ────────────────────────────────────────

  addFinalProduct() {
    if (this.fpName.trim()) {
      this.finalProducts.push({
        name: this.fpName.trim(),
        quantity: this.fpQty.trim() || '',
        unit: this.fpUnit.trim() || '',
      });
      this.fpName = ''; this.fpQty = ''; this.fpUnit = '';
    }
  }

  removeFinalProduct(i: number) { this.finalProducts.splice(i, 1); }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit() {
    this.submitted     = true;
    this.conflictError = null;

    // Mark all controls touched for full validation
    this.form.markAllAsTouched();

    // Check step 1 required fields + CAEB
    const step1Valid = this.form.get('legalName')?.valid &&
                       this.form.get('category')?.valid &&
                       this.caebList.length > 0;

    // Check step 2 required fields
    const step2Valid = this.form.get('district')?.valid &&
                       this.form.get('geoZone')?.valid &&
                       this.form.get('coordinates')?.valid;

    // Check step 3 conditional
    const step3Valid = !this.usesHazardous ||
                       this.form.get('hazardousSubstancesDescription')?.valid;

    // Navigate to first invalid step
    if (!step1Valid) {
      this.currentStep = 1;
      this.cdr.detectChanges();
      return;
    }
    if (!step2Valid) {
      this.currentStep = 2;
      this.cdr.detectChanges();
      return;
    }
    if (!step3Valid) {
      this.currentStep = 3;
      this.cdr.detectChanges();
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const v = this.form.value;

    const payload: Partial<Company> = {
      // Step 1
      legalName:     v.legalName,
      nit:           v.nit           || undefined,
      raiNumber:     v.raiNumber     || undefined,
      category:      v.category,
      businessClass: v.businessClass || undefined,
      legalRepName:  v.legalRepName  || undefined,
      legalRepCi:    v.legalRepCi    || undefined,
      phone:         v.phone         || undefined,
      email:         v.email         || undefined,
      observations:  v.observations  || undefined,
      caebCodes:     this.caebList,

      // Step 2
      municipality:  v.municipality  || undefined,
      address:       v.address       || undefined,
      district:      v.district      || undefined,
      geoZone:       v.geoZone       || undefined,
      coordinates:   v.coordinates   || undefined,
      utmZone:       v.utmZone       || undefined,

      // Step 3
      effluentDisposal:              v.effluentDisposal   || undefined,
      solidWasteDisposal:            v.solidWasteDisposal || undefined,
      useHazardousSubstances:        v.useHazardousSubstances,
      hazardousSubstancesDescription: v.useHazardousSubstances
        ? (v.hazardousSubstancesDescription || undefined)
        : undefined,
      usesMercury: v.usesMercury,

      // Step 4
      economicActivity: v.economicActivity || undefined,
      rawMaterials:     this.rawMaterials.length  ? this.rawMaterials  : undefined,
      finalProducts:    this.finalProducts.length ? this.finalProducts : undefined,
      usedArea:         v.usedArea         ?? undefined,
      areaUnit:         v.areaUnit         || undefined,
      waterSupply:      v.waterSupply      || undefined,
      installedPower:   v.installedPower   ?? undefined,
    };

    const request = this.companyToEdit
      ? this.companyService.updateCompany(this.companyToEdit.id, payload)
      : this.companyService.createCompany(payload);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        showToast('success', this.companyToEdit ? 'Empresa actualizada correctamente' : 'Empresa registrada correctamente');
        this.onFinish();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.conflictError = 'El NIT o número de RAI ya está registrado por otra empresa.';
          this.currentStep   = 1;
        } else {
          alert('Hubo un error al guardar la empresa. Revisa los datos.');
        }
        this.cdr.detectChanges();
      },
    });
  }

  onFinish() {
    this.companyRegistered.emit();
    this.closeForm.emit();
  }
}