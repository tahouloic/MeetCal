import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { Room, RoomRequest } from '../../models/room';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salles.html',
  styleUrls: ['./salles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SallesComponent implements OnInit {
  rooms: Room[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;
  
  roomForm: RoomRequest = {
    building: '',
    floor: 0,
    number: '',
    capacity: 0
  };
  
  // Options pour les bâtiments
  buildings = ['A', 'B', 'C'];
  
  // Options pour les étages
  floors = [
    { value: 0, label: 'RDC (0)' },
    { value: 1, label: 'Étage 1' },
    { value: 2, label: 'Étage 2' },
    { value: 3, label: 'Étage 3' }
  ];
  
  selectedRoomId: string | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.roomService.getAllRooms().subscribe({
      next: (response) => {
        if (response.success) {
          this.rooms = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement salles:', error);
        this.errorMessage = 'Erreur lors du chargement des salles';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.roomForm = {
      building: '',
      floor: 0,
      number: '',
      capacity: 0
    };
    this.selectedRoomId = null;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(room: Room): void {
    this.isEditMode = true;
    this.roomForm = {
      building: room.building,
      floor: room.floor,
      number: room.number,
      capacity: room.capacity
    };
    this.selectedRoomId = room.id;
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.roomForm = {
      building: '',
      floor: 0,
      number: '',
      capacity: 0
    };
    this.selectedRoomId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveRoom(): void {
    if (!this.roomForm.building || !this.roomForm.number || this.roomForm.capacity <= 0) {
      this.errorMessage = 'Tous les champs sont obligatoires et la capacité doit être supérieure à 0';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    if (this.isEditMode && this.selectedRoomId) {
      this.roomService.updateRoom(this.selectedRoomId, this.roomForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Salle modifiée avec succès';
            this.loadRooms();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur modification salle:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.roomService.createRoom(this.roomForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Salle créée avec succès';
            this.loadRooms();
            setTimeout(() => this.closeModal(), 1500);
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur création salle:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteRoom(room: Room): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la salle "${room.code}" ?`)) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    this.roomService.deleteRoom(room.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Salle supprimée avec succès';
          this.loadRooms();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur suppression salle:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }
}
