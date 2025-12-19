import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements OnInit {

  isNavbarScrolled = false;

  ngOnInit(): void {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.body.classList.add('reduce-motion');
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isNavbarScrolled = window.scrollY > 50;

    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (this.isNavbarScrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }


  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (!element) {
      console.warn(`Elemento con ID "${sectionId}" no encontrado`);
      return;
    }


    const navbarHeight = 70;
    const extraMargin = 20;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarHeight - extraMargin;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    setTimeout(() => {
      element.setAttribute('tabindex', '-1');
      element.focus({ preventScroll: true });
    }, 500); 
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Escudo_UNAMBA.png';
      img.alt = 'Logo UNAMBA (fallback)';
      console.warn('Imagen principal no cargó, usando fallback');
    }
  }
}