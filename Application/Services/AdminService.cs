using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NewsPortal.Application.DTOs;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data;

namespace NewsPortal.Application.Services
{
    public class AdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public AdminService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        // Управление пользователями
        public async Task<UserListDto> GetUsersAsync(int page = 1, int pageSize = 10, string searchTerm = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => u.Email.Contains(searchTerm) || 
                                       u.FirstName.Contains(searchTerm) || 
                                       u.LastName.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var userDtos = new List<UserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var articlesCount = await _context.Articles.CountAsync(a => a.AuthorId == user.Id);
                var commentsCount = await _context.Comments.CountAsync(c => c.AuthorId == user.Id);

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    RegisterDate = user.RegisterDate,
                    IsBlocked = user.IsBlocked,
                    EmailConfirmed = user.EmailConfirmed,
                    Roles = roles.ToList(),
                    ArticlesCount = articlesCount,
                    CommentsCount = commentsCount
                });
            }

            return new UserListDto
            {
                Users = userDtos,
                TotalCount = totalCount,
                PageCount = (int)Math.Ceiling(totalCount / (double)pageSize),
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<bool> BlockUserAsync(BlockUserDto blockUserDto)
        {
            var user = await _userManager.FindByIdAsync(blockUserDto.UserId);
            if (user == null) return false;

            user.IsBlocked = blockUserDto.IsBlocked;
            user.BlockReason = blockUserDto.IsBlocked ? blockUserDto.Reason : null;
            
            var result = await _userManager.UpdateAsync(user);
            
            // Логирование действия модератора можно добавить здесь
            
            return result.Succeeded;
        }

        public async Task<bool> UpdateUserRolesAsync(UpdateUserRolesDto updateRolesDto)
        {
            var user = await _userManager.FindByIdAsync(updateRolesDto.UserId);
            if (user == null) return false;

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded) return false;

            var addResult = await _userManager.AddToRolesAsync(user, updateRolesDto.Roles);
            return addResult.Succeeded;
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            try
            {
                // Удаляем связанные данные в правильном порядке
                
                // 1. Удаляем лайки комментариев пользователя
                var commentLikes = await _context.CommentLikes.Where(l => l.UserId == userId).ToListAsync();
                _context.CommentLikes.RemoveRange(commentLikes);

                // 2. Удаляем лайки статей пользователя
                var articleLikes = await _context.ArticleLikes.Where(l => l.UserId == userId).ToListAsync();
                _context.ArticleLikes.RemoveRange(articleLikes);

                // 3. Удаляем комментарии пользователя (включая ответы на них)
                var userComments = await _context.Comments
                    .Include(c => c.Replies)
                    .Include(c => c.Likes)
                    .Where(c => c.AuthorId == userId)
                    .ToListAsync();

                foreach (var comment in userComments)
                {
                    // Удаляем лайки к комментариям
                    _context.CommentLikes.RemoveRange(comment.Likes);
                    
                    // Удаляем ответы на комментарии
                    _context.Comments.RemoveRange(comment.Replies);
                }
                
                // Удаляем сами комментарии пользователя
                _context.Comments.RemoveRange(userComments);

                // 4. Удаляем статьи пользователя со всеми связями
                var userArticles = await _context.Articles
                    .Include(a => a.ArticleCategories)
                    .Include(a => a.ArticleTags)
                    .Include(a => a.Comments).ThenInclude(c => c.Likes)
                    .Include(a => a.Comments).ThenInclude(c => c.Replies)
                    .Include(a => a.Likes)
                    .Where(a => a.AuthorId == userId)
                    .ToListAsync();

                foreach (var article in userArticles)
                {
                    // Удаляем лайки статьи
                    _context.ArticleLikes.RemoveRange(article.Likes);
                    
                    // Удаляем связи с категориями
                    _context.ArticleCategories.RemoveRange(article.ArticleCategories);
                    
                    // Удаляем связи с тегами
                    _context.ArticleTags.RemoveRange(article.ArticleTags);
                    
                    // Удаляем комментарии к статье
                    foreach (var comment in article.Comments)
                    {
                        _context.CommentLikes.RemoveRange(comment.Likes);
                        _context.Comments.RemoveRange(comment.Replies);
                    }
                    _context.Comments.RemoveRange(article.Comments);
                }
                
                // Удаляем сами статьи
                _context.Articles.RemoveRange(userArticles);

                // Сохраняем изменения
                await _context.SaveChangesAsync();

                // 5. Удаляем самого пользователя
                var result = await _userManager.DeleteAsync(user);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                // Логируем ошибку
                Console.WriteLine($"Ошибка при удалении пользователя {userId}: {ex.Message}");
                return false;
            }
        }

        // Управление статьями
        public async Task<ArticleListDto> GetArticlesForModerationAsync(int page = 1, int pageSize = 10, string searchTerm = null)
        {
            var query = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ArticleCategories).ThenInclude(ac => ac.Category)
                .Include(a => a.ArticleTags).ThenInclude(at => at.Tag)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(a => a.Title.Contains(searchTerm) || a.Content.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var articles = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var articleDtos = articles.Select(article => new ArticleDto
            {
                Id = article.Id,
                Title = article.Title,
                Content = article.Content,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt,
                AuthorId = article.AuthorId,
                AuthorName = $"{article.Author?.FirstName} {article.Author?.LastName}".Trim(),
                ViewCount = article.ViewCount,
                ImagePaths = !string.IsNullOrEmpty(article.ImagePaths) 
                    ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(article.ImagePaths) ?? new List<string>()
                    : new List<string>(),
                ImagePath = article.ImagePath,
                Categories = article.ArticleCategories?.Select(ac => new CategoryDto
                {
                    Id = ac.Category.Id,
                    Name = ac.Category.Name,
                    Description = ac.Category.Description
                }).ToList() ?? new List<CategoryDto>(),
                Tags = article.ArticleTags?.Select(at => new TagDto
                {
                    Id = at.Tag.Id,
                    Name = at.Tag.Name
                }).ToList() ?? new List<TagDto>()
            }).ToList();

            return new ArticleListDto
            {
                Articles = articleDtos,
                TotalCount = totalCount,
                PageCount = (int)Math.Ceiling(totalCount / (double)pageSize),
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        // Управление комментариями
        public async Task<CommentListDto> GetCommentsForModerationAsync(int page = 1, int pageSize = 10)
        {
            var query = _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Article)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var comments = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var commentDtos = comments.Select(comment => new CommentDto
            {
                Id = comment.Id,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                AuthorId = comment.AuthorId,
                AuthorName = $"{comment.Author?.FirstName} {comment.Author?.LastName}".Trim(),
                ArticleId = comment.ArticleId,
                ParentCommentId = comment.ParentCommentId,
                LikesCount = comment.Likes?.Count ?? 0,
                IsLikedByCurrentUser = false,
                Replies = new List<CommentDto>()
            }).ToList();

            return new CommentListDto
            {
                Comments = commentDtos,
                TotalCount = totalCount,
                PageCount = (int)Math.Ceiling(totalCount / (double)pageSize),
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<bool> DeleteCommentAsync(int commentId)
        {
            var comment = await _context.Comments
                .Include(c => c.Replies)
                .Include(c => c.Likes)
                .FirstOrDefaultAsync(c => c.Id == commentId);
            
            if (comment == null) return false;

            // Удаляем лайки комментария
            _context.CommentLikes.RemoveRange(comment.Likes);
            
            // Удаляем ответы (дочерние комментарии)
            _context.Comments.RemoveRange(comment.Replies);
            
            // Удаляем сам комментарий
            _context.Comments.Remove(comment);
            
            await _context.SaveChangesAsync();
            return true;
        }

        // Статистика
        public async Task<AdminStatsDto> GetStatsAsync()
        {
            var today = DateTime.UtcNow.Date;
            
            var totalUsers = await _userManager.Users.CountAsync();
            var totalArticles = await _context.Articles.CountAsync();
            var totalComments = await _context.Comments.CountAsync();
            var blockedUsers = await _userManager.Users.CountAsync(u => u.IsBlocked);
            
            var newUsersToday = await _userManager.Users.CountAsync(u => u.RegisterDate >= today);
            var newArticlesToday = await _context.Articles.CountAsync(a => a.CreatedAt >= today);
            var newCommentsToday = await _context.Comments.CountAsync(c => c.CreatedAt >= today);
            
            var categoryStats = await _context.Categories
                .Select(c => new CategoryStatsDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    ArticlesCount = c.ArticleCategories.Count
                })
                .ToListAsync();

            return new AdminStatsDto
            {
                TotalUsers = totalUsers,
                TotalArticles = totalArticles,
                TotalComments = totalComments,
                BlockedUsers = blockedUsers,
                NewUsersToday = newUsersToday,
                NewArticlesToday = newArticlesToday,
                NewCommentsToday = newCommentsToday,
                CategoryStats = categoryStats
            };
        }
    }
} 