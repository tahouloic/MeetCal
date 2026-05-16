
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { RedirectComponent } from './components/redirect/redirect.component';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'comptes',
        loadComponent: () => import('./components/comptes/comptes.component').then(m => m.ComptesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'ecoles',
        loadComponent: () => import('./components/ecoles/ecoles').then(m => m.EcolesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'filieres',
        loadComponent: () => import('./components/filieres/filieres').then(m => m.FilieresComponent),
        canActivate: [authGuard]
    },
    {
        path: 'enseignants',
        loadComponent: () => import('./components/enseignants/enseignants').then(m => m.EnseignantsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'rendez-vous',
        loadComponent: () => import('./components/rendez-vous/rendez-vous').then(m => m.RendezVousComponent),
        canActivate: [authGuard]
    },
    {
        path: 'emplois-temps',
        loadComponent: () => import('./components/emplois-temps/emplois-temps').then(m => m.EmploisTempsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'cours',
        loadComponent: () => import('./components/cours/cours').then(m => m.CoursComponent),
        canActivate: [authGuard]
    },
    {
        path: 'salles',
        loadComponent: () => import('./components/salles/salles').then(m => m.SallesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'classes',
        loadComponent: () => import('./components/classes/classes').then(m => m.ClassesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'etudiants',
        loadComponent: () => import('./components/etudiants/etudiants').then(m => m.EtudiantsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'disponibilites',
        loadComponent: () => import('./components/disponibilites/disponibilites').then(m => m.DisponibilitesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'reservations',
        loadComponent: () => import('./components/reservations/reservations').then(m => m.ReservationsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'parametres',
        loadComponent: () => import('./components/parametres/parametres').then(m => m.ParametresComponent),
        canActivate: [authGuard]
    },
    {
        path: '',
        component: RedirectComponent
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];