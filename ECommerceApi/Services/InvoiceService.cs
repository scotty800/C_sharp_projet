using ECommerceApi.DTO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ECommerceApi.Services
{
    public class InvoiceService : IInvoiceService
    {
        public byte[] GenerateInvoicePdf(OrderResponseDto order)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // ─── En-tête ───
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("FACTURE").FontSize(20).Bold();
                                c.Item().Text($"N° {order.OrderNumber}").FontSize(11).FontColor(Colors.Grey.Darken1);
                            });

                            row.ConstantItem(180).Column(c =>
                            {
                                c.Item().AlignRight().Text($"Date : {order.CreatedAt:dd/MM/yyyy}");
                                if (order.PaidAt.HasValue)
                                    c.Item().AlignRight().Text($"Payée le : {order.PaidAt:dd/MM/yyyy}");
                            });
                        });
                        col.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // ─── Contenu ───
                    page.Content().PaddingVertical(15).Column(col =>
                    {
                        // Adresses
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Facturé à").Bold();
                                c.Item().Text(order.Username);
                                c.Item().Text(order.BillingAddress);
                                c.Item().Text($"{order.BillingPostalCode} {order.BillingCity}");
                                c.Item().Text(order.BillingCountry);
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Livré à").Bold();
                                c.Item().Text(order.ShippingAddress);
                                c.Item().Text($"{order.ShippingPostalCode} {order.ShippingCity}");
                                c.Item().Text(order.ShippingCountry);
                            });
                        });

                        col.Item().PaddingTop(20);

                        // Tableau des articles
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(4);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Article").Bold();
                                header.Cell().AlignRight().Text("Qté").Bold();
                                header.Cell().AlignRight().Text("Prix unitaire").Bold();
                                header.Cell().AlignRight().Text("Total").Bold();
                                header.Cell().ColumnSpan(4).PaddingTop(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten1);
                            });

                            foreach (var item in order.Items)
                            {
                                table.Cell().PaddingVertical(4).Text(item.ProductName);
                                table.Cell().PaddingVertical(4).AlignRight().Text(item.Quantity.ToString());
                                table.Cell().PaddingVertical(4).AlignRight().Text($"{item.UnitPrice:0.00} €");
                                table.Cell().PaddingVertical(4).AlignRight().Text($"{item.TotalPrice:0.00} €");
                            }
                        });

                        // Détail livraison par boutique (si multi-boutiques)
                        if (order.ShippingBreakdown.Count > 1)
                        {
                            col.Item().PaddingTop(15).Text("Détail livraison").Bold();
                            foreach (var s in order.ShippingBreakdown)
                            {
                                col.Item().Row(row =>
                                {
                                    row.RelativeItem().Text($"{s.ShopName} — {s.ShippingMethodName}");
                                    row.ConstantItem(80).AlignRight().Text($"{s.ShippingCost:0.00} €");
                                });
                            }
                        }

                        // Totaux
                        col.Item().PaddingTop(20).AlignRight().Column(c =>
                        {
                            c.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text("Sous-total");
                                row.ConstantItem(80).AlignRight().Text($"{order.TotalAmount:0.00} €");
                            });
                            c.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text("Livraison");
                                row.ConstantItem(80).AlignRight().Text($"{order.ShippingCost:0.00} €");
                            });
                            c.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text("TVA (20%)");
                                row.ConstantItem(80).AlignRight().Text($"{order.TaxAmount:0.00} €");
                            });
                            if (order.DiscountAmount > 0)
                            {
                                c.Item().Row(row =>
                                {
                                    row.ConstantItem(120).Text("Réduction");
                                    row.ConstantItem(80).AlignRight().Text($"-{order.DiscountAmount:0.00} €");
                                });
                            }
                            c.Item().PaddingTop(5).BorderTop(1).BorderColor(Colors.Grey.Lighten1);
                            c.Item().PaddingTop(5).Row(row =>
                            {
                                row.ConstantItem(120).Text("Total").Bold().FontSize(13);
                                row.ConstantItem(80).AlignRight().Text($"{order.FinalAmount:0.00} €").Bold().FontSize(13);
                            });
                        });
                    });

                    // ─── Pied de page ───
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Facture générée automatiquement — ").FontColor(Colors.Grey.Darken1);
                        text.Span($"Commande {order.OrderNumber}").FontColor(Colors.Grey.Darken1);
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}