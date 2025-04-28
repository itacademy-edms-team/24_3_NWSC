using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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

        public LikeService(
            LikeRepository likeRepository,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor)
        {
            _likeRepository = likeRepository;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
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
            var user = await _userManager.FindByIdAsync(createLikeDto.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var like = new ArticleLike
            {
                UserId = createLikeDto.UserId,
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
            var user = await _userManager.FindByIdAsync(createLikeDto.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var like = new CommentLike
            {
                UserId = createLikeDto.UserId,
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