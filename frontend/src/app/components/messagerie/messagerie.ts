/**
 * EXPLICATION :
 * Ce composant gère l'interface de messagerie avec :
 * - Liste des conversations (côté gauche)
 * - Chat actif (côté droit)
 * - Envoi de messages en temps réel
 * 
 * Architecture similaire à WhatsApp/Messenger
 */

import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessagerieService } from '../../services/message';
import { ThemeService } from '../../services/theme.service';
import { Conversation, Message, MessageForm } from '../../models/message';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.html',
  styleUrl: './messagerie.scss'
})
export class MessagerieComponent implements OnInit, AfterViewChecked {
  private messagerieService = inject(MessagerieService);
  private themeService = inject(ThemeService);

  /**
   * ViewChild pour auto-scroll vers le dernier message
   * Permet d'accéder à l'élément DOM du conteneur de messages
   */
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Observables
  conversations$!: Observable<Conversation[]>;
  totalUnreadCount$!: Observable<number>;

  // Conversation active
  selectedConversation: Conversation | null = null;

  // Formulaire de message
  messageContent: string = '';

  // Recherche
  searchQuery: string = '';

  // Flag pour auto-scroll
  private shouldScrollToBottom = false;

  // Accès au service de thème
  get isDarkMode() {
    return this.themeService.darkMode;
  }

  ngOnInit(): void {
    this.loadConversations();
    this.totalUnreadCount$ = this.messagerieService.getTotalUnreadCount();
  }

  /**
   * Hook du cycle de vie Angular
   * S'exécute après chaque détection de changement dans la vue
   * Utilisé ici pour auto-scroll vers le bas quand nouveaux messages
   */
  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Charge les conversations (seulement médecins)
   */
  loadConversations(): void {
    if (this.searchQuery.trim()) {
      this.conversations$ = this.messagerieService.searchConversations(this.searchQuery);
    } else {
      this.conversations$ = this.messagerieService.getConversations();
    }
  }

  /**
   * Recherche
   */
  onSearch(): void {
    this.loadConversations();
  }

  /**
   * Sélectionne une conversation
   * Marque automatiquement les messages comme lus
   */
  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;

    // Marquer comme lu
    if (conversation.unreadCount > 0) {
      this.messagerieService.markAsRead(conversation.id);
    }

    // Déclencher auto-scroll
    this.shouldScrollToBottom = true;
  }

  /**
   * Envoie un message
   */
  sendMessage(): void {
    // Validation
    if (!this.messageContent.trim() || !this.selectedConversation) {
      return;
    }

    // Créer le formulaire
    const messageForm: MessageForm = {
      conversationId: this.selectedConversation.id,
      content: this.messageContent.trim()
    };

    // Envoyer
    this.messagerieService.sendMessage(messageForm);

    // Réinitialiser le champ
    this.messageContent = '';

    // Déclencher auto-scroll
    this.shouldScrollToBottom = true;

    // Recharger les conversations pour mettre à jour l'ordre
    this.loadConversations();
  }

  /**
   * Gère l'appui sur Entrée pour envoyer
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Archive une conversation
   */
  archiveConversation(conversation: Conversation): void {
    const confirmation = confirm(`Archiver la conversation avec ${conversation.participantName} ?`);

    if (confirmation) {
      this.messagerieService.archiveConversation(conversation.id);

      // Si c'était la conversation active, la désélectionner
      if (this.selectedConversation?.id === conversation.id) {
        this.selectedConversation = null;
      }

      this.loadConversations();
    }
  }

  /**
   * Supprime une conversation
   */
  deleteConversation(conversation: Conversation): void {
    const confirmation = confirm(`Supprimer définitivement la conversation avec ${conversation.participantName} ?`);

    if (confirmation) {
      this.messagerieService.deleteConversation(conversation.id);

      // Si c'était la conversation active, la désélectionner
      if (this.selectedConversation?.id === conversation.id) {
        this.selectedConversation = null;
      }

      this.loadConversations();
    }
  }

  /**
   * Scroll automatique vers le bas du conteneur de messages
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur scroll:', err);
    }
  }

  /**
   * Vérifie si un message est envoyé par l'admin
   */
  isMyMessage(message: Message): boolean {
    return message.senderType === 'admin';
  }

  /**
   * Formate l'heure d'un message
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Récupère le temps relatif (il y a X min)
   */
  getRelativeTime(timestamp: string): string {
    return this.messagerieService.getRelativeTime(timestamp);
  }

  /**
   * Badge de type de participant (toujours médecin)
   */
  getParticipantBadgeClass(): string {
    return 'badge-medecin';
  }
}