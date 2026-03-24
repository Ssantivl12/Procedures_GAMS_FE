import {
  Component, EventEmitter, Output, Input,
  OnInit, inject, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, FormsModule,
} from '@angular/forms';
import {
  CompanyService, Company, RawMaterial, FinalProduct,
  DISTRICTS, GEO_ZONES, UTM_ZONES,
  EFFLUENT_DISPOSAL_OPTIONS, SOLID_WASTE_DISPOSAL_OPTIONS,
  WATER_SUPPLY_OPTIONS,
} from '../../services/company.service';

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

  rawMaterials: RawMaterial[]  = [];
  rmName       = ''; rmQty = '';

  finalProducts: FinalProduct[] = [];
  fpName        = ''; fpQty = ''; fpUnit = '';

  // Reactive form
  form!: FormGroup;

  ngOnInit() {
    this.buildForm();
    if (this.companyToEdit) this.patchForm(this.companyToEdit);
  }

  // Build

  private buildForm() {
    this.form = this.fb.group({
      // Step 1 — Identificación
      legalName:     ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      nit:           ['', [Validators.pattern(/^\d{7,13}$/)]],
      raiNumber:     ['', [Validators.pattern(/^\d{9}$/)]],
      category:      ['', [Validators.required]],
      businessClass: [''],
      legalRepName:  [''],
      legalRepCi:    [''],
      phone:         [''],   
      email:         ['', [Validators.email]],
      observations:  [''],

      // Step 2 — Ubicación
      municipality:  [''],
      address:       [''],
      district:      [''],
      geoZone:       [''],
      coordinates:   [''],
      utmZone:       [''],

      // Step 3 — Residuos y sustancias
      effluentDisposal:              [''],
      solidWasteDisposal:            [''],
      useHazardousSubstances:        [false],
      hazardousSubstancesDescription:[''],
      usesMercury:                   [false],

      // Step 4 — Producción y agua
      economicActivity: [''],
      usedArea:         [null],
      areaUnit:         [''],
      waterSupply:      [''],
      installedPower:   [null],
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
      useHazardousSubstances:        c.useHazardousSubstances        ?? false,
      hazardousSubstancesDescription:c.hazardousSubstancesDescription|| '',
      usesMercury:                   c.usesMercury                   ?? false,
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

  // Getters

  get f() { return this.form.controls; }
  get usesHazardous(): boolean {
    return this.form.get('useHazardousSubstances')?.value === true;
  }

  // Step navigation

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
      2: [], 3: [], 4: [],
    };
    let valid = true;
    (required[step] || []).forEach(key => {
      const ctrl = this.form.get(key);
      if (ctrl) { ctrl.markAsTouched(); if (ctrl.invalid) valid = false; }
    });
    return valid;
  }

  isStepValid(step: number): boolean {
    const required: Record<number, string[]> = {
      1: ['legalName', 'category'],
      2: [], 3: [], 4: [],
    };
    return (required[step] || []).every(key => this.form.get(key)?.valid);
  }

  // Dynamic lists — CAEB

  addCaeb() {
    const code = this.caebInput.trim();
    if (/^\d{5,10}$/.test(code) && this.caebList.length < 10 && !this.caebList.includes(code)) {
      this.caebList.push(code);
      this.caebInput = '';
    }
  }

  removeCaeb(i: number) { this.caebList.splice(i, 1); }

  // Dynamic lists — Raw Materials 

  addRawMaterial() {
    if (this.rmName.trim() && this.rmQty.trim()) {
      this.rawMaterials.push({ name: this.rmName.trim(), quantity: this.rmQty.trim() });
      this.rmName = ''; this.rmQty = '';
    }
  }

  removeRawMaterial(i: number) { this.rawMaterials.splice(i, 1); }

  // Dynamic lists — Final Products

  addFinalProduct() {
    if (this.fpName.trim() && this.fpQty.trim() && this.fpUnit.trim()) {
      this.finalProducts.push({
        name: this.fpName.trim(), quantity: this.fpQty.trim(), unit: this.fpUnit.trim(),
      });
      this.fpName = ''; this.fpQty = ''; this.fpUnit = '';
    }
  }

  removeFinalProduct(i: number) { this.finalProducts.splice(i, 1); }

  // Submit

  onSubmit() {
    this.submitted     = true;
    this.conflictError = null;

    ['legalName', 'category'].forEach(k => this.form.get(k)?.markAsTouched());
    if (this.form.get('legalName')?.invalid || this.form.get('category')?.invalid) {
      this.currentStep = 1;
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
        this.isLoading   = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
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