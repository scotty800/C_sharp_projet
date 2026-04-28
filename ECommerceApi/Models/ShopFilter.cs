using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerceApi.Models
{
    public class ShopFilter
    {
        public int Id { get; set; }

        [Required]
        public int ShopId { get; set; }
        [ForeignKey(nameof(ShopId))]
        public Shop Shop { get; set; } = null!;

        // Filtres globaux
        public string GlobalFilter { get; set; } = "none";
        
        // CORRECTION 1: Renommer GlobalCasFilter en GlobalCssFilter (cohérence avec le nom demandé)
        public string? GlobalCssFilter { get; set; }

        // Ajustements globaux
        public float GlobalBrightness { get; set; } = 1.0f;
        public float GlobalContrast { get; set; } = 1.0f;
        public float GlobalSaturation { get; set; } = 1.0f;

        // Filtres d'arrière-plan
        public string BackgroundColor { get; set; } = "none";
        
        // CORRECTION 2: Ajouter la propriété BackgroundFilter manquante
        public string? BackgroundFilter { get; set; }
        
        public float BackgroundBlur { get; set; } = 0f;
        public float BackgroundDarken { get; set; } = 0f;

        // Effets saisonniers
        public string? SeasonalEffect { get; set; }
        public DateTime? SeasonalEffectStart { get; set; }
        public DateTime? SeasonalEffectEnd { get; set; }

        // Animations des filtres
        public bool EnableFilterAnimation { get; set; } = false;
        public string FilterAnimation { get; set; } = "none";
        public int AnimationDuration { get; set; } = 3000;

        // Statut
        public bool IsActive { get; set; } = true;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}