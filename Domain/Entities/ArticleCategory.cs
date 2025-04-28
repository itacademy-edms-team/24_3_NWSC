namespace NewsPortal.Domain.Entities
{
    public class ArticleCategory
    {
        public int ArticleId { get; set; }
        public Article Article { get; set; } = null!;
        
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
} 