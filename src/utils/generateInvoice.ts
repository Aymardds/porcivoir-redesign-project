import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo-porcivoir.png";

const getBase64ImageFromUrl = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageUrl;
  });
};

export const generateInvoicePdfBase64 = async (orderData: any, orderItems: any[]): Promise<string> => {
  const doc = new jsPDF();
  
  try {
    // 1. Ajouter le logo
    const logoBase64 = await getBase64ImageFromUrl(logoUrl);
    doc.addImage(logoBase64, "PNG", 14, 15, 30, 30);
  } catch (error) {
    console.error("Impossible de charger le logo pour le PDF:", error);
    // On continue la génération sans le logo si ça échoue
  }

  // 2. En-tête : Info de l'entreprise
  doc.setFontSize(22);
  doc.setTextColor(0, 154, 85); // Primary color
  doc.text("Porc'Ivoire", 50, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Viande de porc 100% origine Côte d'Ivoire", 50, 31);
  doc.text("Contact: +225 07 87 295 734 | Email: contact@porcivoir.com", 50, 36);
  doc.text("Abidjan, Côte d'Ivoire", 50, 41);

  // 3. Titre et Informations de la facture
  const orderId = orderData.id ? orderData.id.split("-")[0].toUpperCase() : "N/A";
  
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("FACTURE", 140, 25);
  
  doc.setFontSize(10);
  doc.text(`N° Commande : #${orderId}`, 140, 32);
  const orderDate = new Date().toLocaleDateString("fr-FR");
  doc.text(`Date : ${orderDate}`, 140, 37);

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 50, 196, 50);

  // 4. Informations du client
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Facturé / Livré à :", 14, 60);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(orderData.customer_name || "Client", 14, 67);
  doc.text(`Téléphone : ${orderData.customer_phone || orderData.phone_contact}`, 14, 72);
  doc.text(`Adresse : ${orderData.shipping_area || ""}, ${orderData.shipping_city || ""}`, 14, 77);

  // 5. Tableau des articles
  const tableColumn = ["Description", "Prix Unitaire", "Quantité", "Total"];
  const tableRows = [];

  let subtotal = 0;

  orderItems.forEach(item => {
    const itemTotal = item.total_price;
    subtotal += itemTotal;
    const itemData = [
      item.product_name,
      `${item.unit_price.toLocaleString("fr-FR")} FCFA`,
      item.quantity.toString(),
      `${itemTotal.toLocaleString("fr-FR")} FCFA`
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'striped',
    headStyles: { fillColor: [0, 154, 85] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' }
    }
  });

  // 6. Totaux
  const finalY = (doc as any).lastAutoTable.finalY || 85;
  const deliveryFee = orderData.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("Sous-total :", 140, finalY + 10);
  doc.text(`${subtotal.toLocaleString("fr-FR")} FCFA`, 196, finalY + 10, { align: "right" });

  doc.text("Frais de livraison :", 140, finalY + 17);
  doc.text(`${deliveryFee.toLocaleString("fr-FR")} FCFA`, 196, finalY + 17, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("TOTAL NET :", 140, finalY + 27);
  doc.setTextColor(0, 154, 85);
  doc.text(`${total.toLocaleString("fr-FR")} FCFA`, 196, finalY + 27, { align: "right" });

  // 7. Pied de page
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  doc.text("Merci pour votre confiance !", 105, pageHeight - 20, { align: "center" });
  doc.text("Porc'Ivoire - N° d'entreprise: CI-ABJ-000-000-0 - facturation prête au paiement à la livraison.", 105, pageHeight - 15, { align: "center" });

  // 8. Retour base64
  return doc.output('datauristring');
};
