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
  CompanyService, Company, RawMaterial, FinalProduct, LegalRepresentative,
  District, GeoZone, UtmZone, EffluentDisposal, SolidWasteDisposal, WaterSupply
} from '../../services/company.service';
import { showToast } from '../../../../shared/utils/toast.utils';
import * as L from 'leaflet';
import 'leaflet.utm';

// ── Constants / Enum Labels ──────────────────────────────────────────────────

export const districtLabels: Record<string, string> = {
  [District.DISTRITO_1]: 'DISTRITO 1',
  [District.DISTRITO_2]: 'DISTRITO 2',
  [District.DISTRITO_3]: 'DISTRITO 3',
  [District.DISTRITO_4]: 'DISTRITO 4',
  [District.DISTRITO_5]: 'DISTRITO 5',
  [District.DISTRITO_6]: 'DISTRITO 6',
  [District.DISTRITO_7]: 'DISTRITO 7',
  [District.DISTRITO_LAVA_LAVA]: 'DISTRITO LAVA LAVA',
  [District.DISTRITO_CHINATA]: 'DISTRITO CHIÑATA',
  [District.DISTRITO_PALCA]: 'DISTRITO PALCA',
  [District.DISTRITO_AGUIRRE]: 'DISTRITO AGUIRRE',
  [District.DISTRITO_UCUCHI]: 'DISTRITO UCUCHI',
};

export const geoZoneLabels: Record<string, string> = {
  [GeoZone.Urbano]: 'Urbano',
  [GeoZone.Rural]: 'Rural',
};

export const utmZoneLabels: Record<string, string> = {
  [UtmZone.ZONE_19K]: '19K',
  [UtmZone.ZONE_20K]: '20K',
};

export const effluentDisposalLabels: Record<string, string> = {
  [EffluentDisposal.PTAR]: 'PTAR',
  [EffluentDisposal.PTAR_ALCANTARILLADO]: 'PTAR+ALCANTARILLADO',
  [EffluentDisposal.ALCANTARILLADO_COOPERATIVA]: 'ALCANTARILLADO COOPERATIVA',
  [EffluentDisposal.POZO_SEPTICO]: 'POZO SEPTICO',
  [EffluentDisposal.OTRO]: 'OTRO',
};

export const solidWasteLabels: Record<string, string> = {
  [SolidWasteDisposal.GERES]: 'GERES',
  [SolidWasteDisposal.TERCIARIZACION]: 'TERCIARIZACIÓN',
  [SolidWasteDisposal.GERES_TERCIARIZACION]: 'GERES+TERCIARIZACIÓN',
  [SolidWasteDisposal.OTRO]: 'OTRO',
};

export const waterSupplyLabels: Record<string, string> = {
  [WaterSupply.POZO_DE_AGUA]: 'POZO DE AGUA',
  [WaterSupply.RED_DE_AGUA_COOPERATIVA]: 'RED DE AGUA (COOPERATIVA)',
  [WaterSupply.CISTERNA]: 'CISTERNA',
  [WaterSupply.EMAPAS]: 'EMAPAS',
  [WaterSupply.POZO_COOPERATIVA]: 'POZO+COOPERATIVA',
  [WaterSupply.OTROS]: 'OTROS',
};

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

  getEnumOptions(enumObj: any, labelsMap: Record<string, string>) {
    return Object.values(enumObj).map(val => ({
      value: val,
      label: labelsMap[val as string] || val
    }));
  }

  // Select options
  readonly districts               = this.getEnumOptions(District, districtLabels);
  readonly geoZones                = this.getEnumOptions(GeoZone, geoZoneLabels);
  readonly utmZones                = this.getEnumOptions(UtmZone, utmZoneLabels);
  readonly effluentDisposalOptions = this.getEnumOptions(EffluentDisposal, effluentDisposalLabels);
  readonly solidWasteOptions       = this.getEnumOptions(SolidWasteDisposal, solidWasteLabels);
  readonly waterSupplyOptions      = this.getEnumOptions(WaterSupply, waterSupplyLabels);

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

  rawMaterials: RawMaterial[] = [];
  rmName = ''; rmQty = ''; rmUnit = '';

  finalProducts: FinalProduct[] = [];
  fpName = ''; fpQty = ''; fpUnit = '';

  legalRepresentatives: LegalRepresentative[] = [];
  lrName = ''; lrCi = ''; lrPhone = '';

  // Reactive form
  form!: FormGroup;

  // Map state
  showMapModal = false;
  private map?: L.Map;
  private marker?: L.Marker;

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
      phone:         ['', [phoneValidator]], // Mantener para compatibilidad si es necesario, pero usaremos el array
      email:         ['', [Validators.email]],
      observations:  [''],

      // Step 2 — Ubicación
      municipality:  [{ value: 'Sacaba', disabled: true }, [Validators.required]],
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
      municipality:  'Sacaba',
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
    this.legalRepresentatives = [...(c.legalRepresentatives || [])];
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

    // Step 1 also needs at least one CAEB and at least one Legal Representative
    if (step === 1 && (this.caebList.length === 0 || this.legalRepresentatives.length === 0)) {
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
    const repsOk = step !== 1 || this.legalRepresentatives.length > 0;
    return caebOk && repsOk && (required[step] || []).every(key => this.form.get(key)?.valid);
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
      this.rawMaterials.push({ 
        name: this.rmName.trim(), 
        quantity: this.rmQty.trim() || '',
        unit: this.rmUnit.trim() || ''
      });
      this.rmName = ''; this.rmQty = ''; this.rmUnit = '';
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

  // ── Dynamic lists — Legal Representatives ───────────────────────────────────

  addLegalRepresentative() {
    const name = this.lrName.trim();
    if (name) {
      this.legalRepresentatives.push({
        name,
        ci: this.lrCi.trim() || undefined,
        phone: this.lrPhone.trim() || undefined
      });
      this.lrName = ''; this.lrCi = ''; this.lrPhone = '';
    }
  }

  removeLegalRepresentative(i: number) {
    this.legalRepresentatives.splice(i, 1);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit() {
    this.submitted     = true;
    this.conflictError = null;

    // Mark all controls touched for full validation
    this.form.markAllAsTouched();

    // Check step 1 required fields + CAEB
    const step1Valid = this.form.get('legalName')?.valid &&
                       this.form.get('category')?.valid &&
                       this.caebList.length > 0 &&
                       this.legalRepresentatives.length > 0;

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
      legalRepresentatives: this.legalRepresentatives.length ? this.legalRepresentatives : undefined,

      // Step 2
      municipality:  'Sacaba',
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

  // ── Map Logic ──────────────────────────────────────────────────────────────

  openMap() {
    this.showMapModal = true;
    this.cdr.detectChanges();
    setTimeout(() => this.initMap(), 100);
  }

  closeMap() {
    this.showMapModal = false;
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap() {
    if (this.map) return;

    // Default center: Sacaba (-17.4042, -66.0408)
    const lat = -17.4042;
    const lng = -66.0408;

    this.map = L.map('map-container').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Initial marker if coordinates contain latitude/longitude or UTM
    const coordsStr = this.form.get('coordinates')?.value || '';
    
    // Simple extraction for Lat/Lon if they are decimal
    const decimalMatch = coordsStr.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (decimalMatch) {
      const latlng = L.latLng(parseFloat(decimalMatch[1]), parseFloat(decimalMatch[2]));
      this.marker = L.marker(latlng, { draggable: true }).addTo(this.map);
      this.map.setView(latlng, 16);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarker(e.latlng);
    });
  }

  private setMarker(latlng: L.LatLng) {
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, { draggable: true }).addTo(this.map!);
    }
    this.updateCoordsFromLatLng(latlng);
    
    this.marker.on('dragend', () => {
      this.updateCoordsFromLatLng(this.marker!.getLatLng());
    });
  }

  private updateCoordsFromLatLng(latlng: L.LatLng) {
    // Convert to UTM
    // @ts-ignore
    const utm = latlng.utm();
    
    const x = Math.round(utm.x * 100) / 100;
    const y = Math.round(utm.y * 100) / 100;
    const zoneStr = utm.zone === 20 ? '20K' : '19K';
    
    this.form.patchValue({
      utmZone: utm.zone === 20 ? UtmZone.ZONE_20K : UtmZone.ZONE_19K,
      coordinates: `X: ${x}, Y: ${y}, Z: cargando... (${zoneStr})`
    });

    // Fetch Elevation (Z)
    this.fetchElevation(latlng.lat, latlng.lng);
  }

  private fetchElevation(lat: number, lng: number) {
    // Open-Elevation API (Free)
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results[0]) {
          const z = data.results[0].elevation;
          const current = this.form.get('coordinates')?.value || '';
          this.form.patchValue({ 
            coordinates: current.replace('cargando...', Math.round(z).toString())
          });
        }
      })
      .catch(err => console.warn('Elevation API failed', err));
  }
}