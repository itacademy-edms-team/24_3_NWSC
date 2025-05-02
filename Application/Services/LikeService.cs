using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using NewsPortal.Application.DTOs;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data.Repositories;

namespace NewsPortal.Application.Services
{
    public class LikeService
    {
        private readonly LikeRepository _likeRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<LikeService> _logger;

        public LikeService(
            LikeRepository likeRepository,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            ILogger<LikeService> logger)
        {
            _likeRepository = likeRepository;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        // Методы для работы с лайками статей
        public async Task<List<ArticleLikeDto>> GetArticleLikesAsync(int articleId, int page = 1, int pageSize = 10)
        {
            var likes = await _likeRepository.GetArticleLikesAsync(articleId, page, pageSize);
            return likes.Select(MapToArticleLikeDto).ToList();
        }

        public async Task<int> GetArticleLikesCountAsync(int articleId)
        {
            return await _likeRepository.GetArticleLikesCountAsync(articleId);
        }

        public async Task<bool> UserHasLikedArticleAsync(string userId, int articleId)
        {
            return await _likeRepository.UserHasLikedArticleAsync(userId, articleId);
        }

        public async Task<ArticleLikeDto> LikeArticleAsync(CreateArticleLikeDto createLikeDto)
        {
            ApplicationUser user = null;

            // Сначала пытаемся найти пользователя по ID
            if (!string.IsNullOrEmpty(createLikeDto.UserId))
            {
                _logger.LogInformation($"Поиск пользователя по ID: {createLikeDto.UserId}");
                user = await _userManager.FindByIdAsync(createLikeDto.UserId);
            }

            // Если не нашли по ID, пробуем найти по email (если строка похожа на email)
            if (user == null && createLikeDto.UserId != null && createLikeDto.UserId.Contains("@"))
            {
                _logger.LogInformation($"Поиск пользователя по email: {createLikeDto.UserId}");
                user = await _userManager.FindByEmailAsync(createLikeDto.UserId);
            }

            // Если пользователь не найден, пробуем получить текущего пользователя
            if (user == null)
            {
                var currentUserId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    _logger.LogInformation($"Поиск текущего пользователя по ID: {currentUserId}");
                    user = await _userManager.FindByIdAsync(currentUserId);
                }
            }

            // Если пользователь все еще не найден - ошибка
            if (user == null)
            {
                _logger.LogError($"Пользователь не найден с идентификатором: {createLikeDto.UserId}");
                throw new Exception($"User not found with identifier: {createLikeDto.UserId}");
            }

            var like = new ArticleLike
            {
                UserId = user.Id, // Используем ID найденного пользователя
                User = user,
                ArticleId = createLikeDto.ArticleId
            };

            var createdLike = await _likeRepository.LikeArticleAsync(like);
            return MapToArticleLikeDto(createdLike);
        }

        public async Task UnlikeArticleAsync(string userId, int articleId)
        {
            await _likeRepository.UnlikeArticleAsync(userId, articleId);
        }

        // Методы для работы с лайками комментариев
        public async Task<List<CommentLikeDto>> GetCommentLikesAsync(int commentId, int page = 1, int pageSize = 10)
        {
            var likes = await _likeRepository.GetCommentLikesAsync(commentId, page, pageSize);
            return likes.Select(MapToCommentLikeDto).ToList();
        }

        public async Task<int> GetCommentLikesCountAsync(int commentId)
        {
            return await _likeRepository.GetCommentLikesCountAsync(commentId);
        }

        public async Task<bool> UserHasLikedCommentAsync(string userId, int commentId)
        {
            return await _likeRepository.UserHasLikedCommentAsync(userId, commentId);
        }

        public async Task<CommentLikeDto> LikeCommentAsync(CreateCommentLikeDto createLikeDto)
        {
            ApplicationUser user = null;

            // Сначала пытаемся найти пользователя по ID
            if (!string.IsNullOrEmpty(createLikeDto.UserId))
            {
                _logger.LogInformation($"Поиск пользователя по ID: {createLikeDto.UserId}");
                user = await _userManager.FindByIdAsync(createLikeDto.UserId);
            }

            // Если не нашли по ID, пробуем найти по email (если строка похожа на email)
            if (user == null && createLikeDto.UserId != null && createLikeDto.UserId.Contains("@"))
            {
                _logger.LogInformation($"Поиск пользователя по email: {createLikeDto.UserId}");
                user = await _userManager.FindByEmailAsync(createLikeDto.UserId);
            }

            // Если пользователь не найден, пробуем получить текущего пользователя
            if (user == null)
            {
                var currentUserId = GetCurrentUserId();
                if (!string.IsNullOrEmpty(currentUserId))
                {
                    _logger.LogInformation($"Поиск текущего пользователя по ID: {currentUserId}");
                    user = await _userManager.FindByIdAsync(currentUserId);
                }
            }

            // Если пользователь все еще не найден - ошибка
            if (user == null)
            {
                _logger.LogError($"Пользователь не найден с идентификатором: {createLikeDto.UserId}");
                throw new Exception($"User not found with identifier: {createLikeDto.UserId}");
            }

            var like = new CommentLike
            {
                UserId = user.Id, // Используем ID найденного пользователя
                User = user,
                CommentId = createLikeDto.CommentId
            };

            var createdLike = await _likeRepository.LikeCommentAsync(like);
            return MapToCommentLikeDto(createdLike);
        }

        public async Task UnlikeCommentAsync(string userId, int commentId)
        {
            await _likeRepository.UnlikeCommentAsync(userId, commentId);
        }

        // Маппинги
        private ArticleLikeDto MapToArticleLikeDto(ArticleLike like)
        {
            return new ArticleLikeDto
            {
                Id = like.Id,
                UserId = like.UserId,
                UserName = $"{like.User.FirstName} {like.User.LastName}",
                ArticleId = like.ArticleId,
                CreatedAt = like.CreatedAt
            };
        }

        private CommentLikeDto MapToCommentLikeDto(CommentLike like)
        {
            return new CommentLikeDto
            {
                Id = like.Id,
                UserId = like.UserId,
                UserName = $"{like.User.FirstName} {like.User.LastName}",
                CommentId = like.CommentId,
                CreatedAt = like.CreatedAt
            };
        }

        private string GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }
            
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }
} 