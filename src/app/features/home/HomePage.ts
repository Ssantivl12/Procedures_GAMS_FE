import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginButtonComponent } from '../../shared/ui/Login';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, LoginButtonComponent],
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.css',
})
export class HomePage {}

