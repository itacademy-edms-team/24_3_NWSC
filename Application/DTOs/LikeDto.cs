using System;

namespace NewsPortal.Application.DTOs
{
    public class LikeDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
    
    public class ArticleLikeDto : LikeDto
    {
        public int ArticleId { get; set; }
    }
    
    public class CommentLikeDto : LikeDto
    {
        public int CommentId { get; set; }
    }
    
    public class CreateArticleLikeDto
    {
        public string UserId { get; set; } = string.Empty;
        public int ArticleId { get; set; }
    }
    
    public class CreateCommentLikeDto
    {
        public string UserId { get; set; } = string.Empty;
        public int CommentId { get; set; }
    }
} 