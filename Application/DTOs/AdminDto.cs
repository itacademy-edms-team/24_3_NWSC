using System;
using System.Collections.Generic;

namespace NewsPortal.Application.DTOs
{
    public class AdminArticleDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorEmail { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int CommentsCount { get; set; }
        public int LikesCount { get; set; }
        public List<string> ImagePaths { get; set; } = new List<string>();
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }
    
    public class AdminCommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorEmail { get; set; } = string.Empty;
        public int ArticleId { get; set; }
        public string ArticleTitle { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
        public int LikesCount { get; set; }
        public bool IsReported { get; set; }
        public int RepliesCount { get; set; }
    }
    
    public class ModerationActionDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Article" или "Comment"
        public string Action { get; set; } = string.Empty; // "Delete", "Block", "Approve"
        public string Reason { get; set; } = string.Empty;
        public string AdminId { get; set; } = string.Empty;
    }
    
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalArticles { get; set; }
        public int TotalComments { get; set; }
        public int BlockedUsers { get; set; }
        public int NewUsersToday { get; set; }
        public int NewArticlesToday { get; set; }
        public int NewCommentsToday { get; set; }
        public List<CategoryStatsDto> CategoryStats { get; set; } = new List<CategoryStatsDto>();
    }
    
    public class CategoryStatsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ArticlesCount { get; set; }
    }
} 