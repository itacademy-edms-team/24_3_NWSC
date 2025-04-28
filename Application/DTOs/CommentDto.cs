using System;
using System.Collections.Generic;

namespace NewsPortal.Application.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public int ArticleId { get; set; }
        public int? ParentCommentId { get; set; }
        public int LikesCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>();
    }

    public class CreateCommentDto
    {
        public string Text { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;
        public int ArticleId { get; set; }
        public int? ParentCommentId { get; set; }
    }

    public class UpdateCommentDto
    {
        public string Text { get; set; } = string.Empty;
    }

    public class CommentListDto
    {
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
} 