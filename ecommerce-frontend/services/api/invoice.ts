import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrderResponseDto } from '@/types/order';
import { formatPrice, formatDate } from '@/services/utils/formatters';

export const generateInvoice = (order: OrderResponseDto, user: any) => {
  // Créer un nouveau document PDF
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(229, 9, 20); // Couleur primaire
  doc.text('FACTURE', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${order.orderNumber}`, 14, 30);
  doc.text(`Date: ${formatDate(order.createdAt, 'long')}`, 14, 36);
  
  // Informations client
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Facturé à:', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(user.username, 14, 58);
  doc.text(user.email, 14, 64);
  doc.text(order.billingAddress, 14, 70);
  doc.text(`${order.billingPostalCode} ${order.billingCity}`, 14, 76);
  doc.text(order.billingCountry, 14, 82);
  
  // Informations boutique
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Vendeur:', 120, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('MarketPlace', 120, 58);
  doc.text('contact@marketplace.com', 120, 64);
  doc.text('1 rue du Commerce', 120, 70);
  doc.text('75001 Paris', 120, 76);
  doc.text('France', 120, 82);
  
  // Tableau des articles
  const tableColumn = ["Article", "Prix unitaire", "Quantité", "Total"];
  const tableRows: any[] = [];
  
  order.items.forEach(item => {
    const itemData = [
      item.productName,
      formatPrice(item.unitPrice),
      item.quantity,
      formatPrice(item.totalPrice)
    ];
    tableRows.push(itemData);
  });
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [229, 9, 20], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  // Récapitulatif des prix
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Sous-total:', 120, finalY);
  doc.text(formatPrice(order.totalAmount), 170, finalY, { align: 'right' });
  
  doc.text('Livraison:', 120, finalY + 6);
  doc.text(formatPrice(order.shippingCost), 170, finalY + 6, { align: 'right' });
  
  doc.text('TVA (20%):', 120, finalY + 12);
  doc.text(formatPrice(order.taxAmount), 170, finalY + 12, { align: 'right' });
  
  if (order.discountAmount > 0) {
    doc.text('Réduction:', 120, finalY + 18);
    doc.text(`-${formatPrice(order.discountAmount)}`, 170, finalY + 18, { align: 'right' });
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');  // ✅ CORRIGÉ : 'helvetica' au lieu de undefined
  doc.text('TOTAL:', 120, finalY + 26);
  doc.setTextColor(229, 9, 20);
  doc.text(formatPrice(order.finalAmount), 170, finalY + 26, { align: 'right' });
  
  // Pied de page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Merci de votre confiance !', 14, 280);
  doc.text('Paiement sécurisé par Stripe', 120, 280);
  
  // Télécharger le PDF
  doc.save(`facture-${order.orderNumber}.pdf`);
};