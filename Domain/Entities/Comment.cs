using System;
using System.Collections.Generic;

namespace NewsPortal.Domain.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Связь с автором
        public string AuthorId { get; set; } = string.Empty;
        public ApplicationUser Author { get; set; } = null!;
        
        // Связь со статьей
        public int ArticleId { get; set; }
        public Article Article { get; set; } = null!;
        
        // Родительский комментарий (для иерархии комментариев)
        public int? ParentCommentId { get; set; }
        public Comment? ParentComment { get; set; }
        
        // Дочерние комментарии (ответы)
        public ICollection<Comment> Replies { get; set; } = new List<Comment>();
        
        // Лайки к комментарию
        public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
    }
} 