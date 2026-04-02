import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autotable types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFData {
  company: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  quote: {
    id: string;
    date: string;
    status: string;
    fixed_fee: number;
    subtotal: number;
    total: number;
    items: any[];
  };
}

export const generateQuotePDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header ---
  doc.setFillColor(242, 101, 34); // Porc'Ivoire Orange
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name.toUpperCase(), 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.company.email} | ${data.company.phone}`, 15, 28);
  doc.text("Abidjan, Côte d'Ivoire", 15, 33);

  doc.setFontSize(24);
  doc.text("DEVIS", pageWidth - 50, 25);

  // --- Client Info ---
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("DESTINATAIRE :", 15, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(data.client.name, 15, 62);
  doc.text(data.client.email, 15, 68);
  doc.text(data.client.phone, 15, 74);
  doc.text(data.client.address, 15, 80, { maxWidth: 80 });

  // --- Quote Details ---
  doc.setFont('helvetica', 'bold');
  doc.text("DÉTAILS DU DEVIS :", pageWidth - 80, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Devis : ${data.quote.id.slice(0, 8).toUpperCase()}`, pageWidth - 80, 62);
  doc.text(`Date : ${data.quote.date}`, pageWidth - 80, 68);
  doc.text(`Statut : Confirmé (Payé)`, pageWidth - 80, 74);

  // --- Table ---
  const tableRows = data.quote.items.map(item => [
    item.title,
    `${item.quantity}`,
    `${item.price.toLocaleString()} FCFA`,
    `${(item.price * item.quantity).toLocaleString()} FCFA`
  ]);

  doc.autoTable({
    startY: 95,
    head: [['Description du Service', 'Qté', 'Prix Unitaire', 'Total']],
    body: tableRows,
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 },
    styles: { font: 'helvetica', fontSize: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // --- Totals ---
  doc.setFontSize(11);
  doc.text("Sous-total :", pageWidth - 80, finalY);
  doc.text(`${data.quote.subtotal.toLocaleString()} FCFA`, pageWidth - 35, finalY, { align: 'right' });

  doc.text("Frais de dossier :", pageWidth - 80, finalY + 7);
  doc.text(`${data.quote.fixed_fee.toLocaleString()} FCFA`, pageWidth - 35, finalY + 7, { align: 'right' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(242, 101, 34);
  doc.rect(pageWidth - 85, finalY + 12, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL :", pageWidth - 80, finalY + 19);
  doc.text(`${data.quote.total.toLocaleString()} FCFA`, pageWidth - 20, finalY + 19, { align: 'right' });

  // --- Footer ---
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text("Ce document est un devis officiel généré par Porc'Ivoire Agri.", pageWidth / 2, 280, { align: 'center' });
  doc.text("Merci de votre confiance !", pageWidth / 2, 285, { align: 'center' });

  doc.save(`Devis_${data.quote.id.slice(0, 8)}.pdf`);
};

export const generateReceiptPDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Simple
  doc.setFillColor(0, 150, 0); // Green for Receipt
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("REÇU DE PAIEMENT", 15, 25);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction : ${data.quote.id.slice(0, 12).toUpperCase()}`, 15, 33);

  // Content
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.text("CONFIRMATION DE PAIEMENT", 15, 60);
  
  doc.setFontSize(11);
  doc.text(`Nous confirmons avoir reçu le paiement de la part de :`, 15, 70);
  doc.setFont('helvetica', 'bold');
  doc.text(data.client.name.toUpperCase(), 15, 78);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date du paiement : ${data.quote.date}`, 15, 88);
  doc.text(`Montant total réglé : ${data.quote.total.toLocaleString()} FCFA`, 15, 96);
  doc.text(`Mode de paiement : CinetPay (Mobile Money / Carte)`, 15, 104);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 115, pageWidth - 15, 115);

  doc.setFontSize(10);
  doc.text("Ce reçu sert de preuve de paiement pour les frais de dossier de votre devis.", 15, 125);
  doc.text(`Référence Devis : ${data.quote.id}`, 15, 131);

  // Signature area
  doc.text("L'Équipe Porc'Ivoire Agri", pageWidth - 60, 160);
  doc.setFontSize(8);
  doc.text("(Document généré électroniquement)", pageWidth - 65, 165);

  doc.save(`Recu_${data.quote.id.slice(0, 8)}.pdf`);
};
