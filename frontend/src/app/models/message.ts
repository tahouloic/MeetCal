/**
 * EXPLICATION :
 * La messagerie fonctionne avec un système de CONVERSATIONS.
 * Chaque conversation contient plusieurs messages.
 * 
 * Architecture :
 * - 1 Conversation = Admin ↔ (Patient OU Médecin)
 * - 1 Conversation contient N Messages
 * - Messages envoyés/reçus en temps réel (simulé avec BehaviorSubject)
 */

// Interface pour un Message individuel
export interface Message {
    id: string;                   // ID unique du message
    conversationId: string;       // ID de la conversation parente
    senderId: string;             // ID de l'expéditeur
    senderName: string;           // Nom de l'expéditeur
    senderType: 'admin' | 'patient' | 'medecin';  // Type d'expéditeur
    content: string;              // Contenu du message
    timestamp: string;            // Date et heure d'envoi
    isRead: boolean;              // Message lu ou non
    attachments?: Attachment[];   // Pièces jointes (optionnel)
}

// Interface pour une Conversation
export interface Conversation {
    id: string;                   // ID unique de la conversation
    participantId: string;        // ID du patient ou médecin
    participantName: string;      // Nom du participant
    participantType: 'patient' | 'medecin';  // Type de participant
    lastMessage: string;          // Dernier message (aperçu)
    lastMessageTime: string;      // Date du dernier message
    unreadCount: number;          // Nombre de messages non lus
    messages: Message[];          // Tous les messages de la conversation
    isActive: boolean;            // Conversation active/archivée
}

// Interface pour une pièce jointe
export interface Attachment {
    id: string;
    name: string;                 // Nom du fichier
    type: string;                 // Type MIME (image/pdf/etc)
    url: string;                  // URL du fichier
    size: number;                 // Taille en bytes
}

// Interface pour le formulaire d'envoi de message
export interface MessageForm {
    conversationId: string;
    content: string;
    attachments?: Attachment[];
}

// Interface pour les notifications de message
export interface MessageNotification {
    conversationId: string;
    senderName: string;
    preview: string;
    timestamp: string;
}

// Types de participants
export type ParticipantType = 'patient' | 'medecin';

// Statuts de message
export type MessageStatus = 'sent' | 'delivered' | 'read';
