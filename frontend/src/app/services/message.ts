/**
 * EXPLICATION :
 * Ce service gère toute la logique de la messagerie.
 * 
 * Fonctionnalités :
 * - Chargement des conversations
 * - Envoi de messages en temps réel
 * - Marquage des messages comme lus
 * - Compteur de messages non lus
 * - Recherche de conversations
 * 
 * Simulation temps réel :
 * - Utilise BehaviorSubject pour émettre les changements
 * - Simule des réponses automatiques (démo)
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs';
import { Conversation, Message, MessageForm } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {

  /**
   * BehaviorSubject pour stocker toutes les conversations (seulement médecins)
   * Programmation réactive (CHAP 3)
   */
  private conversations$: BehaviorSubject<Conversation[]> = new BehaviorSubject<Conversation[]>([
    {
      id: 'CONV002',
      participantId: 'M001',
      participantName: 'Dr. Jean Martin',
      participantType: 'medecin',
      lastMessage: 'Les résultats sont prêts',
      lastMessageTime: '2024-12-02T09:45:00',
      unreadCount: 0,
      isActive: true,
      messages: [
        {
          id: 'MSG005',
          conversationId: 'CONV002',
          senderId: 'M001',
          senderName: 'Dr. Jean Martin',
          senderType: 'medecin',
          content: 'Bonjour, j\'ai besoin d\'accéder au dossier du patient P005',
          timestamp: '2024-12-02T08:30:00',
          isRead: true
        },
        {
          id: 'MSG006',
          conversationId: 'CONV002',
          senderId: 'ADMIN',
          senderName: 'Admin',
          senderType: 'admin',
          content: 'Bonjour Docteur, l\'accès a été accordé',
          timestamp: '2024-12-02T09:00:00',
          isRead: true
        },
        {
          id: 'MSG007',
          conversationId: 'CONV002',
          senderId: 'M001',
          senderName: 'Dr. Jean Martin',
          senderType: 'medecin',
          content: 'Les résultats sont prêts',
          timestamp: '2024-12-02T09:45:00',
          isRead: true
        }
      ]
    },
    {
      id: 'CONV004',
      participantId: 'M002',
      participantName: 'Dr. Sophie Laurent',
      participantType: 'medecin',
      lastMessage: 'Merci pour la validation',
      lastMessageTime: '2024-12-02T11:30:00',
      unreadCount: 1,
      isActive: true,
      messages: [
        {
          id: 'MSG011',
          conversationId: 'CONV004',
          senderId: 'M002',
          senderName: 'Dr. Sophie Laurent',
          senderType: 'medecin',
          content: 'Bonjour, pouvez-vous valider mon inscription ?',
          timestamp: '2024-12-02T10:00:00',
          isRead: true
        },
        {
          id: 'MSG012',
          conversationId: 'CONV004',
          senderId: 'ADMIN',
          senderName: 'Admin',
          senderType: 'admin',
          content: 'Bonjour Docteur, votre inscription a été validée',
          timestamp: '2024-12-02T10:30:00',
          isRead: true
        },
        {
          id: 'MSG013',
          conversationId: 'CONV004',
          senderId: 'M002',
          senderName: 'Dr. Sophie Laurent',
          senderType: 'medecin',
          content: 'Merci pour la validation',
          timestamp: '2024-12-02T11:30:00',
          isRead: false
        }
      ]
    },
    {
      id: 'CONV005',
      participantId: 'M003',
      participantName: 'Dr. Pierre Bernard',
      participantType: 'medecin',
      lastMessage: 'Parfait, merci beaucoup',
      lastMessageTime: '2024-12-01T16:45:00',
      unreadCount: 0,
      isActive: true,
      messages: [
        {
          id: 'MSG014',
          conversationId: 'CONV005',
          senderId: 'M003',
          senderName: 'Dr. Pierre Bernard',
          senderType: 'medecin',
          content: 'Bonjour, j\'ai une question sur les nouveaux protocoles',
          timestamp: '2024-12-01T15:30:00',
          isRead: true
        },
        {
          id: 'MSG015',
          conversationId: 'CONV005',
          senderId: 'ADMIN',
          senderName: 'Admin',
          senderType: 'admin',
          content: 'Bonjour Docteur, je vous envoie la documentation',
          timestamp: '2024-12-01T16:00:00',
          isRead: true
        },
        {
          id: 'MSG016',
          conversationId: 'CONV005',
          senderId: 'M003',
          senderName: 'Dr. Pierre Bernard',
          senderType: 'medecin',
          content: 'Parfait, merci beaucoup',
          timestamp: '2024-12-01T16:45:00',
          isRead: true
        }
      ]
    }
  ]);

  /**
   * ID de l'admin (utilisateur connecté)
   */
  private readonly ADMIN_ID = 'ADMIN';
  private readonly ADMIN_NAME = 'Admin';

  constructor() { }

  /**
   * Récupère toutes les conversations
   */
  getConversations(): Observable<Conversation[]> {
    return this.conversations$.asObservable();
  }

  /**
   * Récupère une conversation par ID
   */
  getConversationById(id: string): Conversation | undefined {
    return this.conversations$.value.find(c => c.id === id);
  }

  /**
   * Envoie un message dans une conversation
   * 
   * IMPORTANT : Met à jour :
   * - La liste des messages
   * - Le dernier message de la conversation
   * - L'heure du dernier message
   */
  sendMessage(messageForm: MessageForm): void {
    const conversation = this.getConversationById(messageForm.conversationId);

    if (!conversation) {
      console.error('Conversation introuvable');
      return;
    }

    // Créer le nouveau message
    const newMessage: Message = {
      id: this.generateMessageId(conversation.messages.length),
      conversationId: messageForm.conversationId,
      senderId: this.ADMIN_ID,
      senderName: this.ADMIN_NAME,
      senderType: 'admin',
      content: messageForm.content,
      timestamp: new Date().toISOString(),
      isRead: true,
      attachments: messageForm.attachments
    };

    // Mettre à jour la conversation
    const updatedConversation: Conversation = {
      ...conversation,
      lastMessage: messageForm.content,
      lastMessageTime: newMessage.timestamp,
      messages: [...conversation.messages, newMessage]
    };

    // Mettre à jour la liste des conversations
    this.updateConversation(updatedConversation);

    // Simuler une réponse automatique après 2 secondes (pour la démo)
    setTimeout(() => {
      this.simulateAutoReply(messageForm.conversationId);
    }, 2000);
  }

  /**
   * Marque tous les messages d'une conversation comme lus
   */
  markAsRead(conversationId: string): void {
    const conversation = this.getConversationById(conversationId);

    if (!conversation) return;

    // Marquer tous les messages comme lus
    const updatedMessages = conversation.messages.map(msg => ({
      ...msg,
      isRead: true
    }));

    // Réinitialiser le compteur de non lus
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      unreadCount: 0
    };

    this.updateConversation(updatedConversation);
  }

  /**
   * Recherche dans les conversations (seulement médecins)
   */
  searchConversations(query: string): Observable<Conversation[]> {
    const searchTerm = query.toLowerCase();

    return this.conversations$.pipe(
      map(conversations => conversations.filter(conv =>
        conv.participantName.toLowerCase().includes(searchTerm) ||
        conv.lastMessage.toLowerCase().includes(searchTerm)
      ))
    );
  }

  /**
   * Récupère le nombre total de messages non lus
   */
  getTotalUnreadCount(): Observable<number> {
    return this.conversations$.pipe(
      map(conversations =>
        conversations.reduce((total, conv) => total + conv.unreadCount, 0)
      )
    );
  }

  /**
   * Archive une conversation
   */
  archiveConversation(conversationId: string): void {
    const conversation = this.getConversationById(conversationId);

    if (!conversation) return;

    const updatedConversation: Conversation = {
      ...conversation,
      isActive: false
    };

    this.updateConversation(updatedConversation);
  }

  /**
   * Supprime une conversation
   */
  deleteConversation(conversationId: string): void {
    const currentConversations = this.conversations$.value;
    this.conversations$.next(
      currentConversations.filter(c => c.id !== conversationId)
    );
  }

  /**
   * Met à jour une conversation dans la liste
   */
  private updateConversation(updatedConversation: Conversation): void {
    const currentConversations = this.conversations$.value;
    const index = currentConversations.findIndex(c => c.id === updatedConversation.id);

    if (index !== -1) {
      currentConversations[index] = updatedConversation;

      // Trier par date (plus récent en premier)
      const sorted = currentConversations.sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      this.conversations$.next([...sorted]);
    }
  }

  /**
   * Simule une réponse automatique (pour la démo)
   * Dans une vraie app, les réponses viendraient du serveur via WebSocket
   */
  private simulateAutoReply(conversationId: string): void {
    const conversation = this.getConversationById(conversationId);

    if (!conversation) return;

    const autoReplyMessages = [
      'Merci pour votre message, je vous réponds bientôt',
      'Message bien reçu !',
      'Je prends note, merci',
      'D\'accord, je vais vérifier ça'
    ];

    const randomReply = autoReplyMessages[Math.floor(Math.random() * autoReplyMessages.length)];

    const autoReply: Message = {
      id: this.generateMessageId(conversation.messages.length),
      conversationId: conversationId,
      senderId: conversation.participantId,
      senderName: conversation.participantName,
      senderType: conversation.participantType,
      content: randomReply,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updatedConversation: Conversation = {
      ...conversation,
      lastMessage: randomReply,
      lastMessageTime: autoReply.timestamp,
      unreadCount: conversation.unreadCount + 1,
      messages: [...conversation.messages, autoReply]
    };

    this.updateConversation(updatedConversation);
  }

  /**
   * Génère un ID unique pour un message
   */
  private generateMessageId(count: number): string {
    const newNumber = count + 1;
    return `MSG${newNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Formatte la date relative (il y a X minutes/heures)
   */
  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return messageTime.toLocaleDateString('fr-FR');
  }
}