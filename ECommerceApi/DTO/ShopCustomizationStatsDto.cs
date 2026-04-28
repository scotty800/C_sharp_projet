namespace ECommerceApi.DTO
{
    public class ShopCustomizationStatsDto
    {
        public int SectionsCount { get; set; }
        public int AssetsCount { get; set; }
        public int FiltersCount { get; set; }
        public bool IsPublished { get; set; }
        public DateTime LastModified { get; set; }
        public int Version { get; set; }
        public int TotalViews { get; set; }
        public int TotalEdits { get; set; }
    }
}