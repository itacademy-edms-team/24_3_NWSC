using System.Collections.Generic;

namespace NewsPortal.Domain.Entities
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
    }
} 