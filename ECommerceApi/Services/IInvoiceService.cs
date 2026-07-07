using ECommerceApi.DTO;

namespace ECommerceApi.Services
{
    public interface IInvoiceService
    {
        byte[] GenerateInvoicePdf(OrderResponseDto order);
    }
}