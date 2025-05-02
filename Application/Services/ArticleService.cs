using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using NewsPortal.Application.DTOs;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data.Repositories;

namespace NewsPortal.Application.Services
{
    public class ArticleService
    {
        private readonly ArticleRepository _articleRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public ArticleService(ArticleRepository articleRepository, UserManager<ApplicationUser> userManager)
        {
            _articleRepository = articleRepository;
            _userManager = userManager;
        }

        public async Task<ArticleListDto> GetAllArticlesAsync(int page = 1, int pageSize = 10, string searchTerm = null)
        {
            var articles = await _articleRepository.GetAllArticlesAsync(page, pageSize, searchTerm);
            var totalCount = await _articleRepository.GetArticlesCountAsync(searchTerm);
            var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

            var articleDtos = articles.Select(MapToArticleDto).ToList();

            return new ArticleListDto
            {
                Articles = articleDtos,
                TotalCount = totalCount,
                PageCount = pageCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<ArticleDto> GetArticleByIdAsync(int id)
        {
            var article = await _articleRepository.GetArticleByIdAsync(id);
            if (article == null)
            {
                return null;
            }

            return MapToArticleDto(article);
        }

        public async Task<ArticleDto> GetArticleByIdWithViewAsync(int id)
        {
            var article = await _articleRepository.GetArticleByIdAsync(id);
            if (article == null)
            {
                return null;
            }

            await IncrementViewCountAsync(id);
            
            return MapToArticleDto(article);
        }

        public async Task<bool> IncrementViewCountAsync(int articleId)
        {
            var article = await _articleRepository.GetArticleByIdAsync(articleId);
            if (article == null)
            {
                return false;
            }
            
            article.ViewCount++;
            await _articleRepository.UpdateArticleAsync(article);
            return true;
        }

        public async Task<ArticleDto> CreateArticleAsync(CreateArticleDto createArticleDto)
        {
            if (string.IsNullOrEmpty(createArticleDto.AuthorId))
            {
                throw new ArgumentException("Author ID cannot be empty", nameof(createArticleDto.AuthorId));
            }
            
            // Проверяем, является ли authorId email или идентификатором пользователя
            ApplicationUser user = null;
            
            // Если строка содержит @, считаем её email
            if (createArticleDto.AuthorId.Contains("@"))
            {
                user = await _userManager.FindByEmailAsync(createArticleDto.AuthorId);
                if (user == null)
                {
                    throw new InvalidOperationException($"User with email {createArticleDto.AuthorId} not found");
                }
            }
            else
            {
                // Иначе пробуем найти по ID
                user = await _userManager.FindByIdAsync(createArticleDto.AuthorId);
                if (user == null)
                {
                    throw new InvalidOperationException($"User with ID {createArticleDto.AuthorId} not found");
                }
            }

            var article = new Article
            {
                Title = createArticleDto.Title,
                Content = createArticleDto.Content,
                AuthorId = user.Id,
                Author = user
            };

            foreach (var categoryId in createArticleDto.CategoryIds)
            {
                article.ArticleCategories.Add(new ArticleCategory
                {
                    CategoryId = categoryId
                });
            }

            foreach (var tagId in createArticleDto.TagIds)
            {
                article.ArticleTags.Add(new ArticleTag
                {
                    TagId = tagId
                });
            }

            var createdArticle = await _articleRepository.CreateArticleAsync(article);
            return MapToArticleDto(createdArticle);
        }

        public async Task<ArticleDto> UpdateArticleAsync(int id, UpdateArticleDto updateArticleDto)
        {
            var article = await _articleRepository.GetArticleByIdAsync(id);
            if (article == null)
            {
                return null;
            }

            article.Title = updateArticleDto.Title;
            article.Content = updateArticleDto.Content;

            // Update categories
            article.ArticleCategories.Clear();
            foreach (var categoryId in updateArticleDto.CategoryIds)
            {
                article.ArticleCategories.Add(new ArticleCategory
                {
                    ArticleId = id,
                    CategoryId = categoryId
                });
            }

            // Update tags
            article.ArticleTags.Clear();
            foreach (var tagId in updateArticleDto.TagIds)
            {
                article.ArticleTags.Add(new ArticleTag
                {
                    ArticleId = id,
                    TagId = tagId
                });
            }

            var updatedArticle = await _articleRepository.UpdateArticleAsync(article);
            return MapToArticleDto(updatedArticle);
        }

        public async Task DeleteArticleAsync(int id)
        {
            await _articleRepository.DeleteArticleAsync(id);
        }

        public async Task<ArticleListDto> GetArticlesByCategoryAsync(int categoryId, int page = 1, int pageSize = 10)
        {
            var articles = await _articleRepository.GetArticlesByCategoryAsync(categoryId, page, pageSize);
            var totalCount = articles.Count; // For simplicity, we're not getting the total count
            var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

            var articleDtos = articles.Select(MapToArticleDto).ToList();

            return new ArticleListDto
            {
                Articles = articleDtos,
                TotalCount = totalCount,
                PageCount = pageCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<ArticleListDto> GetArticlesByTagAsync(int tagId, int page = 1, int pageSize = 10)
        {
            var articles = await _articleRepository.GetArticlesByTagAsync(tagId, page, pageSize);
            var totalCount = articles.Count; // For simplicity, we're not getting the total count
            var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

            var articleDtos = articles.Select(MapToArticleDto).ToList();

            return new ArticleListDto
            {
                Articles = articleDtos,
                TotalCount = totalCount,
                PageCount = pageCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<ArticleListDto> GetPopularArticlesAsync(int page = 1, int pageSize = 10)
        {
            // Получаем статьи, отсортированные по количеству просмотров
            var articles = await _articleRepository.GetPopularArticlesAsync(page, pageSize);
            var totalCount = await _articleRepository.GetArticlesCountAsync(null);
            var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

            var articleDtos = articles.Select(MapToArticleDto).ToList();

            return new ArticleListDto
            {
                Articles = articleDtos,
                TotalCount = totalCount,
                PageCount = pageCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<int> GetArticlesCountAsync()
        {
            return await _articleRepository.GetArticlesCountAsync(null);
        }

        private ArticleDto MapToArticleDto(Article article)
        {
            // Защита от null в полях Author, Categories и Tags
            var authorName = "Unknown";
            if (article.Author != null)
            {
                var firstName = article.Author.FirstName ?? "";
                var lastName = article.Author.LastName ?? "";
                authorName = $"{firstName} {lastName}".Trim();
                if (string.IsNullOrWhiteSpace(authorName))
                {
                    authorName = article.Author.UserName ?? "Unknown";
                }
            }
            
            return new ArticleDto
            {
                Id = article.Id,
                Title = article.Title ?? "",
                Content = article.Content ?? "",
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                AuthorId = article.AuthorId ?? "",
                AuthorName = authorName,
                ViewCount = article.ViewCount,
                Categories = article.ArticleCategories?
                    .Where(ac => ac.Category != null)
                    .Select(ac => new CategoryDto
                    {
                        Id = ac.Category.Id,
                        Name = ac.Category.Name ?? "",
                        Description = ac.Category.Description ?? ""
                    })
                    .ToList() ?? new List<CategoryDto>(),
                Tags = article.ArticleTags?
                    .Where(at => at.Tag != null)
                    .Select(at => new TagDto
                    {
                        Id = at.Tag.Id,
                        Name = at.Tag.Name ?? ""
                    })
                    .ToList() ?? new List<TagDto>()
            };
        }
    }
} 