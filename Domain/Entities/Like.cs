using System;

namespace NewsPortal.Domain.Entities
{
    // Базовая модель для лайков
    public abstract class Like
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Связь с пользователем
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
    }
    
    // Модель для лайков статей
    public class ArticleLike : Like
    {
        // Связь со статьей
        public int ArticleId { get; set; }
        public Article Article { get; set; } = null!;
    }
    
    // Модель для лайков комментариев
    public class CommentLike : Like
    {
        // Связь с комментарием
        public int CommentId { get; set; }
        public Comment Comment { get; set; } = null!;
    }
} 