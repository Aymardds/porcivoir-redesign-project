import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceOrder {
  id: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address: string;
  shipping_area?: string;
  total_amount: number;
  delivery_fee?: number;
  payment_method?: string;
  created_at: string;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export function generateInvoicePdf(order: InvoiceOrder): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const primaryGreen = [0, 154, 85] as [number, number, number];
  const darkGreen = [26, 46, 26] as [number, number, number];
  const orange = [255, 119, 0] as [number, number, number];
  const lightGray = [245, 245, 245] as [number, number, number];

  // ── Header band ──────────────────────────────────────────────
  doc.setFillColor(...primaryGreen);
  doc.rect(0, 0, pageW, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text("Porc'Ivoire", 15, 17);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Produit par les meilleures fermes d\'ici', 15, 24);
  doc.text([
    'Abidjan, Côte d\'Ivoire',
    '+225 07 87 295 734',
    'contact@porcivoir.com',
  ], 15, 29);

  // FACTURE label (right)
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FACTURE', pageW - 15, 22, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceNum = `#${order.id.split('-')[0].toUpperCase()}`;
  doc.text(invoiceNum, pageW - 15, 30, { align: 'right' });

  // ── Invoice meta ─────────────────────────────────────────────
  const issueDate = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date d'émission : ${issueDate}`, pageW - 15, 45, { align: 'right' });

  // ── Bill To ───────────────────────────────────────────────────
  doc.setFillColor(...lightGray);
  doc.roundedRect(13, 42, 85, 30, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', 18, 50);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkGreen);
  doc.text(order.customer_name || 'Client', 18, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  if (order.customer_phone) doc.text(`📞 ${order.customer_phone}`, 18, 63);
  doc.text(`📍 ${order.shipping_address}${order.shipping_area ? `, ${order.shipping_area}` : ''}`, 18, 68, {
    maxWidth: 78,
  });

  // ── Items table ───────────────────────────────────────────────
  const subtotal = order.items.reduce((s, i) => s + i.total_price, 0);
  const deliveryFee = order.delivery_fee ?? 0;

  autoTable(doc, {
    startY: 80,
    head: [['Article', 'Qté', 'Prix unitaire', 'Total']],
    body: order.items.map(item => [
      item.product_name,
      item.quantity.toString(),
      `${item.unit_price.toLocaleString('fr-FR')} FCFA`,
      `${item.total_price.toLocaleString('fr-FR')} FCFA`,
    ]),
    headStyles: {
      fillColor: primaryGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 38 },
      3: { halign: 'right', cellWidth: 40, fontStyle: 'bold' },
    },
    margin: { left: 13, right: 13 },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.1,
  });

  // ── Totals block ─────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  const totalsX = pageW - 75;
  const totalsW = 62;

  const drawTotalRow = (label: string, value: string, y: number, bold = false, color?: [number, number, number]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...(color ?? ([80, 80, 80] as [number, number, number])));
    doc.text(label, totalsX, y);
    doc.text(value, totalsX + totalsW, y, { align: 'right' });
  };

  drawTotalRow('Sous-total', `${subtotal.toLocaleString('fr-FR')} FCFA`, finalY);
  drawTotalRow('Frais de livraison', `${deliveryFee.toLocaleString('fr-FR')} FCFA`, finalY + 7);

  // Divider
  doc.setDrawColor(...primaryGreen);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 2, finalY + 10, totalsX + totalsW, finalY + 10);

  doc.setFillColor(...primaryGreen);
  doc.roundedRect(totalsX - 4, finalY + 12, totalsW + 6, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', totalsX, finalY + 19);
  doc.text(`${order.total_amount.toLocaleString('fr-FR')} FCFA`, totalsX + totalsW, finalY + 19, { align: 'right' });

  // Payment method
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  const payMethod = order.payment_method === 'online' ? 'Paiement en ligne (CinetPay)' : 'Paiement à la livraison';
  doc.text(`Mode de paiement : ${payMethod}`, 13, finalY + 19);

  // ── Footer ────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...darkGreen);
  doc.rect(0, pageH - 22, pageW, 22, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(
    `© ${new Date().getFullYear()} Porc'Ivoire — Merci pour votre confiance !`,
    pageW / 2, pageH - 13, { align: 'center' }
  );
  doc.setTextColor(...(orange as [number, number, number]));
  doc.text(
    'porcivoir.com  |  +225 07 87 295 734  |  contact@porcivoir.com',
    pageW / 2, pageH - 7, { align: 'center' }
  );

  return doc.output('datauristring');
}
