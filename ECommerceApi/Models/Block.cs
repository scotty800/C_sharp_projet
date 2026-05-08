namespace ECommerceApi.Models
{
    public class BlockPosition
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; } = 0;
        public int Height { get; set; } = 0;
        public int ZIndex { get; set; } = 0;
        public string? PositionType { get; set; } = "absolute"; // absolute, relative, fixed
        public string? Alignment { get; set; } = "center"; // top-left, top-center, center, bottom-left, etc.
    }

    public class Block
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Type { get; set; } = "section";
        public string Name { get; set; } = "";
        public int Order { get; set; }
        public bool IsVisible { get; set; } = true;
        public BlockPosition? Position { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new();
        public List<Block> Children { get; set; } = new();

        public float Brightness { get; set; } = 1f;
        public float Contrast { get; set; } = 1f;
        public float Saturation { get; set; } = 1f;
        public float Blur { get; set; } = 0f;
        public string? CssFilter { get; set; } = "none";
    }
}