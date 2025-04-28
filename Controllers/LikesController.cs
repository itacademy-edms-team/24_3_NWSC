using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NewsPortal.Application.DTOs;
using NewsPortal.Application.Services;

namespace NewsPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikesController : ControllerBase
    {
        private readonly LikeService _likeService;

        public LikesController(LikeService likeService)
        {
            _likeService = likeService;
        }

        // GET: api/Likes/Article/5
        [HttpGet("Article/{articleId}")]
        public async Task<ActionResult<List<ArticleLikeDto>>> GetArticleLikes(
            int articleId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var likes = await _likeService.GetArticleLikesAsync(articleId, page, pageSize);
            return Ok(likes);
        }

        // GET: api/Likes/Article/5/Count
        [HttpGet("Article/{articleId}/Count")]
        public async Task<ActionResult<int>> GetArticleLikesCount(int articleId)
        {
            var count = await _likeService.GetArticleLikesCountAsync(articleId);
            return Ok(count);
        }

        // GET: api/Likes/Article/5/HasLiked
        [HttpGet("Article/{articleId}/HasLiked")]
        [Authorize]
        public async Task<ActionResult<bool>> UserHasLikedArticle(int articleId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasLiked = await _likeService.UserHasLikedArticleAsync(userId, articleId);
            return Ok(hasLiked);
        }

        // POST: api/Likes/Article
        [HttpPost("Article")]
        [Authorize]
        public async Task<ActionResult<ArticleLikeDto>> LikeArticle(CreateArticleLikeDto createLikeDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            createLikeDto.UserId = userId;
            
            var like = await _likeService.LikeArticleAsync(createLikeDto);
            return Ok(like);
        }

        // DELETE: api/Likes/Article/5
        [HttpDelete("Article/{articleId}")]
        [Authorize]
        public async Task<IActionResult> UnlikeArticle(int articleId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _likeService.UnlikeArticleAsync(userId, articleId);
            return NoContent();
        }

        // GET: api/Likes/Comment/5
        [HttpGet("Comment/{commentId}")]
        public async Task<ActionResult<List<CommentLikeDto>>> GetCommentLikes(
            int commentId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var likes = await _likeService.GetCommentLikesAsync(commentId, page, pageSize);
            return Ok(likes);
        }

        // GET: api/Likes/Comment/5/Count
        [HttpGet("Comment/{commentId}/Count")]
        public async Task<ActionResult<int>> GetCommentLikesCount(int commentId)
        {
            var count = await _likeService.GetCommentLikesCountAsync(commentId);
            return Ok(count);
        }

        // GET: api/Likes/Comment/5/HasLiked
        [HttpGet("Comment/{commentId}/HasLiked")]
        [Authorize]
        public async Task<ActionResult<bool>> UserHasLikedComment(int commentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasLiked = await _likeService.UserHasLikedCommentAsync(userId, commentId);
            return Ok(hasLiked);
        }

        // POST: api/Likes/Comment
        [HttpPost("Comment")]
        [Authorize]
        public async Task<ActionResult<CommentLikeDto>> LikeComment(CreateCommentLikeDto createLikeDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            createLikeDto.UserId = userId;
            
            var like = await _likeService.LikeCommentAsync(createLikeDto);
            return Ok(like);
        }

        // DELETE: api/Likes/Comment/5
        [HttpDelete("Comment/{commentId}")]
        [Authorize]
        public async Task<IActionResult> UnlikeComment(int commentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _likeService.UnlikeCommentAsync(userId, commentId);
            return NoContent();
        }
    }
} 