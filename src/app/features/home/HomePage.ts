import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginButtonComponent } from '../../shared/ui/Login';
import { GamsNavbarComponent } from '../../shared/ui/Navbar';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, LoginButtonComponent, GamsNavbarComponent],
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.css',
})
export class HomePage {}

