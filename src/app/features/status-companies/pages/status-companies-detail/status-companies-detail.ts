import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-status-companies-detail',
  standalone: true,
  template: '',
})
export class StatusCompaniesDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/companies', id], { replaceUrl: true });
  }
}
