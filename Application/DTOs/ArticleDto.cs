using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace NewsPortal.Application.DTOs
{
    public class ArticleDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int CommentsCount { get; set; }
        public int LikeCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public List<string> ImagePaths { get; set; } = new List<string>();
        public string? ImagePath { get; set; }
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }

    public class CreateArticleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;
        public List<int> CategoryIds { get; set; } = new List<int>();
        public List<int> TagIds { get; set; } = new List<int>();
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
    }

    public class UpdateArticleDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<int> CategoryIds { get; set; } = new List<int>();
        public List<int> TagIds { get; set; } = new List<int>();
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
        public List<string> ImagePaths { get; set; } = new List<string>();
    }

    public class ArticleListDto
    {
        public List<ArticleDto> Articles { get; set; } = new List<ArticleDto>();
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
} 