using System;
using System.Collections.Generic;

namespace NewsPortal.Domain.Entities
{
    public class Article
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public string AuthorId { get; set; } = string.Empty;
        public ApplicationUser Author { get; set; } = null!;
        
        // Счетчик просмотров
        public int ViewCount { get; set; } = 0;
        
        public ICollection<ArticleCategory> ArticleCategories { get; set; } = new List<ArticleCategory>();
        public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
        
        // Комментарии к статье
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        
        // Лайки к статье
        public ICollection<ArticleLike> Likes { get; set; } = new List<ArticleLike>();
    }
} 