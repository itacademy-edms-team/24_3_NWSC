using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using NewsPortal.Application.DTOs;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data.Repositories;
using System.Text.Json;

namespace NewsPortal.Application.Services
{
    public class ArticleService
    {
        private readonly ArticleRepository _articleRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _environment;

        public ArticleService(ArticleRepository articleRepository, UserManager<ApplicationUser> userManager, IWebHostEnvironment environment)
        {
            _articleRepository = articleRepository;
            _userManager = userManager;
            _environment = environment;
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

            // Обработка загрузки изображений
            var imagePaths = new List<string>();
            
            // Обрабатываем массив изображений
            if (createArticleDto.Images != null && createArticleDto.Images.Count > 0)
            {
                foreach (var image in createArticleDto.Images)
                {
                    var imagePath = await SaveImageAsync(image);
                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        imagePaths.Add(imagePath);
                    }
                }
            }

            // Конвертируем переносы строк в HTML
            string htmlContent = ConvertTextToHtml(createArticleDto.Content);

            var article = new Article
            {
                Title = createArticleDto.Title,
                Content = htmlContent,
                AuthorId = user.Id,
                Author = user,
                ImagePaths = imagePaths.Count > 0 ? JsonSerializer.Serialize(imagePaths) : null,
                ImagePath = imagePaths.FirstOrDefault() // Для обратной совместимости
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

            // Обработка загрузки новых изображений
            if (updateArticleDto.Images != null && updateArticleDto.Images.Count > 0)
            {
                // Удаляем старые изображения если они есть
                if (!string.IsNullOrEmpty(article.ImagePaths))
                {
                    try
                    {
                        var oldImagePaths = System.Text.Json.JsonSerializer.Deserialize<List<string>>(article.ImagePaths);
                        if (oldImagePaths != null)
                        {
                            foreach (var oldImagePath in oldImagePaths)
                            {
                                await DeleteImageAsync(oldImagePath);
                            }
                        }
                    }
                    catch
                    {
                        // Если не удалось десериализовать, пробуем удалить как одиночный путь
                        if (!string.IsNullOrEmpty(article.ImagePath))
                        {
                            await DeleteImageAsync(article.ImagePath);
                        }
                    }
                }
                else if (!string.IsNullOrEmpty(article.ImagePath))
                {
                    await DeleteImageAsync(article.ImagePath);
                }
                
                // Сохраняем новые изображения
                var imagePaths = new List<string>();
                foreach (var image in updateArticleDto.Images)
                {
                    var imagePath = await SaveImageAsync(image);
                    if (!string.IsNullOrEmpty(imagePath))
                    {
                        imagePaths.Add(imagePath);
                    }
                }
                
                article.ImagePaths = imagePaths.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(imagePaths) : null;
                article.ImagePath = imagePaths.FirstOrDefault(); // Для обратной совместимости
            }

            article.Title = updateArticleDto.Title;
            article.Content = ConvertTextToHtml(updateArticleDto.Content);

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
            
            // Десериализуем пути изображений
            var imagePaths = new List<string>();
            if (!string.IsNullOrEmpty(article.ImagePaths))
            {
                try
                {
                    imagePaths = System.Text.Json.JsonSerializer.Deserialize<List<string>>(article.ImagePaths) ?? new List<string>();
                }
                catch
                {
                    imagePaths = new List<string>();
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
                CommentsCount = article.Comments?.Count ?? 0,
                LikeCount = article.Likes?.Count ?? 0,
                IsLikedByCurrentUser = false, // TODO: implement based on current user
                ImagePaths = imagePaths,
                ImagePath = article.ImagePath,
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

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return null;

            // Валидация типа файла
            var allowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(image.ContentType.ToLower()))
            {
                throw new ArgumentException("Поддерживаются только изображения в форматах: JPEG, PNG, GIF, WebP");
            }

            // Валидация размера файла (максимум 5MB)
            const int maxFileSize = 5 * 1024 * 1024; // 5MB
            if (image.Length > maxFileSize)
            {
                throw new ArgumentException("Размер файла не должен превышать 5MB");
            }

            // Создаем папку для загрузки если её нет
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "articles");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Генерируем уникальное имя файла
            var fileExtension = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Сохраняем файл
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Возвращаем относительный путь
            return $"/uploads/articles/{fileName}";
        }

        private async Task DeleteImageAsync(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return;

            var fullPath = Path.Combine(_environment.WebRootPath, imagePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }

        private string ConvertTextToHtml(string text)
        {
            if (string.IsNullOrEmpty(text))
                return string.Empty;

            // Заменяем переносы строк на HTML теги
            return text.Replace("\r\n", "<br>").Replace("\n", "<br>").Replace("\r", "<br>");
        }
    }
} 