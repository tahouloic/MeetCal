/**
 * SERVICE D'EXPORT
 * Permet d'exporter des données en PDF, Excel, CSV
 * 
 * Dépendances :
 * - jsPDF : Génération de PDF
 * - jspdf-autotable : Tableaux dans PDF
 */

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DossierMedical } from '../models/dossier';
import { Patient } from '../models/patient';
import { Medecin } from '../models/medecin';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporte un dossier médical en PDF
   */
  exportDossierToPDF(dossier: DossierMedical): void {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // Bleu Med-Connect
    doc.text('Med-Connect', 15, 15);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Dossier Médical', 15, 25);

    // Ligne de séparation
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 30, 195, 30);

    // Informations du dossier
    let yPos = 40;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations générales', 15, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(`ID Dossier: ${dossier.id}`, 15, yPos);
    yPos += 6;
    doc.text(`Patient: ${dossier.patientPrenom} ${dossier.patientNom}`, 15, yPos);
    yPos += 6;
    doc.text(`Médecin: Dr. ${dossier.medecinPrenom} ${dossier.medecinNom}`, 15, yPos);
    yPos += 6;
    doc.text(`Date de création: ${dossier.dateCreation}`, 15, yPos);
    yPos += 6;
    doc.text(`Statut: ${dossier.statut}`, 15, yPos);
    yPos += 6;
    doc.text(`Groupe sanguin: ${dossier.groupeSanguin || 'Non renseigné'}`, 15, yPos);

    yPos += 10;

    // Diagnostic principal
    if (dossier.diagnosticPrincipal) {
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnostic principal', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(dossier.diagnosticPrincipal, 15, yPos);
      yPos += 10;
    }

    // Allergies
    if (dossier.allergies && dossier.allergies.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Allergies', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(dossier.allergies.join(', '), 15, yPos);
      yPos += 10;
    }

    // Antécédents
    if (dossier.antecedentsMedicaux && dossier.antecedentsMedicaux.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Antécédents médicaux', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(dossier.antecedentsMedicaux.join(', '), 15, yPos);
      yPos += 10;
    }

    // Tableau des consultations
    if (dossier.consultations && dossier.consultations.length > 0) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Historique des consultations (${dossier.nombreConsultations})`, 15, yPos);
      yPos += 5;

      // Données du tableau
      const tableData = dossier.consultations.map(c => [
        c.date,
        c.motif,
        c.diagnostic,
        c.prescription || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Motif', 'Diagnostic', 'Prescription']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
          3: { cellWidth: 55 }
        }
      });
    }

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        15,
        285
      );
    }

    // Téléchargement
    doc.save(`dossier-${dossier.id}-${dossier.patientNom}.pdf`);
  }

  /**
   * Exporte la liste des patients en PDF
   */
  exportPatientsToPDF(patients: Patient[]): void {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Med-Connect', 15, 15);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Liste des Patients', 15, 25);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total: ${patients.length} patients`, 15, 32);

    // Tableau
    const tableData = patients.map(p => [
      p.id,
      `${p.prenom} ${p.nom}`,
      p.email,
      p.telephone,
      p.statut
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Nom & Prénom', 'Email', 'Téléphone', 'Statut']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      }
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        15,
        285
      );
    }

    doc.save(`patients-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Exporte la liste des médecins en PDF
   */
  exportMedecinsToPDF(medecins: Medecin[]): void {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Med-Connect', 15, 15);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Liste des Médecins', 15, 25);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Total: ${medecins.length} médecins`, 15, 32);

    // Tableau
    const tableData = medecins.map(m => [
      m.id,
      `Dr. ${m.prenom} ${m.nom}`,
      m.specialite,
      `${m.experience} ans`,
      m.verified ? 'Vérifié' : 'En attente'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Nom', 'Spécialité', 'Expérience', 'Vérification']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      }
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${i} sur ${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        15,
        285
      );
    }

    doc.save(`medecins-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Exporte en CSV
   */
  exportToCSV<T>(data: T[], filename: string, headers?: string[]): void {
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    // Récupérer les clés du premier objet
    const keys = headers || Object.keys(data[0] as any);

    // Créer l'en-tête
    let csv = keys.join(';') + '\n';

    // Ajouter les données
    data.forEach(item => {
      const row = keys.map(key => {
        const value = (item as any)[key];
        // Échapper les guillemets et virgules
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csv += row.join(';') + '\n';
    });

    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
