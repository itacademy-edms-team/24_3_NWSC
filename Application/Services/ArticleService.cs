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

        public async Task<ArticleDto> CreateArticleAsync(CreateArticleDto createArticleDto)
        {
            var user = await _userManager.FindByIdAsync(createArticleDto.AuthorId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var article = new Article
            {
                Title = createArticleDto.Title,
                Content = createArticleDto.Content,
                AuthorId = createArticleDto.AuthorId,
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

        private ArticleDto MapToArticleDto(Article article)
        {
            return new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Content = article.Content,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                AuthorId = article.AuthorId,
                AuthorName = $"{article.Author.FirstName} {article.Author.LastName}",
                Categories = article.ArticleCategories.Select(ac => new CategoryDto
                {
                    Id = ac.Category.Id,
                    Name = ac.Category.Name,
                    Description = ac.Category.Description
                }).ToList(),
                Tags = article.ArticleTags.Select(at => new TagDto
                {
                    Id = at.Tag.Id,
                    Name = at.Tag.Name
                }).ToList()
            };
        }
    }
} 