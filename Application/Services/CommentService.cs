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
    public class CommentService
    {
        private readonly CommentRepository _commentRepository;
        private readonly LikeRepository _likeRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CommentService(
            CommentRepository commentRepository,
            LikeRepository likeRepository,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor)
        {
            _commentRepository = commentRepository;
            _likeRepository = likeRepository;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<CommentListDto> GetArticleCommentsAsync(int articleId, int page = 1, int pageSize = 10)
        {
            var comments = await _commentRepository.GetArticleCommentsAsync(articleId, page, pageSize);
            var totalCount = await _commentRepository.GetArticleCommentsCountAsync(articleId);
            var pageCount = (int)Math.Ceiling(totalCount / (double)pageSize);

            var currentUserId = GetCurrentUserId();
            var commentDtos = await MapToCommentDtosAsync(comments, currentUserId);

            return new CommentListDto
            {
                Comments = commentDtos,
                TotalCount = totalCount,
                PageCount = pageCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<CommentDto> GetCommentByIdAsync(int id)
        {
            var comment = await _commentRepository.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return null;
            }

            var currentUserId = GetCurrentUserId();
            return await MapToCommentDtoAsync(comment, currentUserId);
        }

        public async Task<CommentDto> CreateCommentAsync(CreateCommentDto createCommentDto)
        {
            var user = await _userManager.FindByIdAsync(createCommentDto.AuthorId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var comment = new Comment
            {
                Text = createCommentDto.Text,
                ArticleId = createCommentDto.ArticleId,
                AuthorId = createCommentDto.AuthorId,
                Author = user,
                ParentCommentId = createCommentDto.ParentCommentId
            };

            var createdComment = await _commentRepository.CreateCommentAsync(comment);
            return await MapToCommentDtoAsync(createdComment, createdComment.AuthorId);
        }

        public async Task<CommentDto> UpdateCommentAsync(int id, UpdateCommentDto updateCommentDto)
        {
            var comment = await _commentRepository.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return null;
            }

            comment.Text = updateCommentDto.Text;

            var updatedComment = await _commentRepository.UpdateCommentAsync(comment);
            var currentUserId = GetCurrentUserId();
            return await MapToCommentDtoAsync(updatedComment, currentUserId);
        }

        public async Task DeleteCommentAsync(int id)
        {
            await _commentRepository.DeleteCommentAsync(id);
        }

        private async Task<List<CommentDto>> MapToCommentDtosAsync(List<Comment> comments, string currentUserId)
        {
            var result = new List<CommentDto>();
            
            foreach (var comment in comments)
            {
                result.Add(await MapToCommentDtoAsync(comment, currentUserId));
            }
            
            return result;
        }

        private async Task<CommentDto> MapToCommentDtoAsync(Comment comment, string currentUserId)
        {
            var isLiked = !string.IsNullOrEmpty(currentUserId) && 
                await _likeRepository.UserHasLikedCommentAsync(currentUserId, comment.Id);
                
            var likesCount = await _likeRepository.GetCommentLikesCountAsync(comment.Id);
            
            var replies = comment.Replies != null && comment.Replies.Any()
                ? await MapToCommentDtosAsync(comment.Replies.ToList(), currentUserId)
                : new List<CommentDto>();
                
            return new CommentDto
            {
                Id = comment.Id,
                Text = comment.Text,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                AuthorId = comment.AuthorId,
                AuthorName = $"{comment.Author.FirstName} {comment.Author.LastName}",
                ArticleId = comment.ArticleId,
                ParentCommentId = comment.ParentCommentId,
                LikesCount = likesCount,
                IsLikedByCurrentUser = isLiked,
                Replies = replies
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