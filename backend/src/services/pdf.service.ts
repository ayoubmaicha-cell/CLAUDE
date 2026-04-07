import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class PDFService {
  static generateDeclarationPDF(declaration: any, client: any, cabinet: any): Readable {
    const doc = new PDFDocument();

    // Header
    doc.fontSize(20).text('DÉCLARATION FISCALE', 100, 50);
    doc.fontSize(10).text(`Cabinet: ${cabinet.name}`, 100, 80);
    doc.text(`Adresse: ${cabinet.address}`, 100, 95);
    doc.text(`Téléphone: ${cabinet.phone}`, 100, 110);

    // Client info
    doc.fontSize(14).text('Informations du Client', 100, 150);
    doc.fontSize(10);
    doc.text(`Nom: ${client.firstName} ${client.lastName}`, 100, 180);
    doc.text(`Email: ${client.email}`, 100, 195);
    doc.text(`Téléphone: ${client.phone}`, 100, 210);
    doc.text(`CIN: ${client.cin}`, 100, 225);
    doc.text(`Numéro ICE: ${client.iceNumber}`, 100, 240);

    // Declaration info
    doc.fontSize(14).text('Détails de la Déclaration', 100, 290);
    doc.fontSize(10);
    doc.text(`Type: ${declaration.type}`, 100, 320);
    doc.text(`Année: ${declaration.year}`, 100, 335);
    if (declaration.quarter) {
      doc.text(`Trimestre: ${declaration.quarter}`, 100, 350);
    }
    doc.text(`Statut: ${declaration.status}`, 100, 365);

    // Declaration data
    doc.fontSize(14).text('Données Fiscales', 100, 420);
    doc.fontSize(10);

    let yPosition = 450;
    for (const [key, value] of Object.entries(declaration.data || {})) {
      doc.text(`${key}: ${JSON.stringify(value)}`, 100, yPosition);
      yPosition += 15;
    }

    // Footer
    doc.fontSize(8).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 100, 750);

    return doc;
  }

  static generateTaxSummaryPDF(declarations: any[], cabinet: any): Readable {
    const doc = new PDFDocument();

    doc.fontSize(20).text('RÉSUMÉ FISCAL ANNUEL', 100, 50);
    doc.fontSize(10).text(`Cabinet: ${cabinet.name}`, 100, 80);
    doc.text(`Année: ${new Date().getFullYear()}`, 100, 95);

    // Table header
    doc.fontSize(12).text('Déclarations', 100, 150);

    let yPosition = 180;
    for (const declaration of declarations) {
      doc.fontSize(10);
      doc.text(
        `${declaration.client.firstName} ${declaration.client.lastName} - ${declaration.type}`,
        100,
        yPosition
      );
      yPosition += 20;
    }

    doc.fontSize(8).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 100, 750);

    return doc;
  }
}
