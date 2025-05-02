using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        private readonly ILogger<LikesController> _logger;

        public LikesController(LikeService likeService, ILogger<LikesController> logger)
        {
            _likeService = likeService;
            _logger = logger;
        }

        // GET: api/Likes/Article/5
        [HttpGet("Article/{articleId}")]
        public async Task<ActionResult<List<ArticleLikeDto>>> GetArticleLikes(
            int articleId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            _logger.LogInformation($"Получение списка лайков статьи {articleId}, page={page}, pageSize={pageSize}");
            var likes = await _likeService.GetArticleLikesAsync(articleId, page, pageSize);
            return Ok(likes);
        }

        // GET: api/Likes/Article/5/Count
        [HttpGet("Article/{articleId}/Count")]
        public async Task<ActionResult<int>> GetArticleLikesCount(int articleId)
        {
            _logger.LogInformation($"Запрос на получение количества лайков статьи {articleId}");
            var count = await _likeService.GetArticleLikesCountAsync(articleId);
            _logger.LogInformation($"Статья {articleId} имеет {count} лайков");
            return Ok(count);
        }

        // GET: api/Likes/Article/5/HasLiked
        [HttpGet("Article/{articleId}/HasLiked")]
        [Authorize]
        public async Task<ActionResult<bool>> UserHasLikedArticle(int articleId)
        {
            try 
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Проверка лайка статьи {articleId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при проверке лайка статьи");
                    return Unauthorized("User ID not found in token");
                }
                
                var hasLiked = await _likeService.UserHasLikedArticleAsync(userId, articleId);
                _logger.LogInformation($"Пользователь {userId} {(hasLiked ? "лайкнул" : "не лайкал")} статью {articleId}");
                return Ok(hasLiked);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при проверке лайка статьи {articleId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // POST: api/Likes/Article
        [HttpPost("Article")]
        [Authorize]
        public async Task<ActionResult<ArticleLikeDto>> LikeArticle(CreateArticleLikeDto createLikeDto)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Постановка лайка статье {createLikeDto.ArticleId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                // Гарантируем, что мы используем ID из токена, а не переданный извне
                createLikeDto.UserId = userId;
                
                // Дополнительная проверка на наличие userId
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при постановке лайка статье");
                    return BadRequest("User ID not found in token");
                }
                
                var like = await _likeService.LikeArticleAsync(createLikeDto);
                _logger.LogInformation($"Лайк статье {createLikeDto.ArticleId} успешно поставлен пользователем {userId}");
                return Ok(like);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при постановке лайка статье {createLikeDto.ArticleId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // DELETE: api/Likes/Article/5
        [HttpDelete("Article/{articleId}")]
        [Authorize]
        public async Task<IActionResult> UnlikeArticle(int articleId)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Удаление лайка статьи {articleId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при удалении лайка статьи");
                    return BadRequest("User ID not found in token");
                }
                
                await _likeService.UnlikeArticleAsync(userId, articleId);
                _logger.LogInformation($"Лайк статьи {articleId} успешно удален пользователем {userId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении лайка статьи {articleId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // GET: api/Likes/Comment/5
        [HttpGet("Comment/{commentId}")]
        public async Task<ActionResult<List<CommentLikeDto>>> GetCommentLikes(
            int commentId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            _logger.LogInformation($"Получение списка лайков комментария {commentId}, page={page}, pageSize={pageSize}");
            var likes = await _likeService.GetCommentLikesAsync(commentId, page, pageSize);
            return Ok(likes);
        }

        // GET: api/Likes/Comment/5/Count
        [HttpGet("Comment/{commentId}/Count")]
        public async Task<ActionResult<int>> GetCommentLikesCount(int commentId)
        {
            _logger.LogInformation($"Запрос на получение количества лайков комментария {commentId}");
            var count = await _likeService.GetCommentLikesCountAsync(commentId);
            _logger.LogInformation($"Комментарий {commentId} имеет {count} лайков");
            return Ok(count);
        }

        // GET: api/Likes/Comment/5/HasLiked
        [HttpGet("Comment/{commentId}/HasLiked")]
        [Authorize]
        public async Task<ActionResult<bool>> UserHasLikedComment(int commentId)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Проверка лайка комментария {commentId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при проверке лайка комментария");
                    return Unauthorized("User ID not found in token");
                }
                
                var hasLiked = await _likeService.UserHasLikedCommentAsync(userId, commentId);
                _logger.LogInformation($"Пользователь {userId} {(hasLiked ? "лайкнул" : "не лайкал")} комментарий {commentId}");
                return Ok(hasLiked);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при проверке лайка комментария {commentId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // POST: api/Likes/Comment
        [HttpPost("Comment")]
        [Authorize]
        public async Task<ActionResult<CommentLikeDto>> LikeComment(CreateCommentLikeDto createLikeDto)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Постановка лайка комментарию {createLikeDto.CommentId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                // Гарантируем, что мы используем ID из токена, а не переданный извне
                createLikeDto.UserId = userId;
                
                // Дополнительная проверка на наличие userId
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при постановке лайка комментарию");
                    return BadRequest("User ID not found in token");
                }
                
                var like = await _likeService.LikeCommentAsync(createLikeDto);
                _logger.LogInformation($"Лайк комментарию {createLikeDto.CommentId} успешно поставлен пользователем {userId}");
                return Ok(like);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при постановке лайка комментарию {createLikeDto.CommentId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // DELETE: api/Likes/Comment/5
        [HttpDelete("Comment/{commentId}")]
        [Authorize]
        public async Task<IActionResult> UnlikeComment(int commentId)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                _logger.LogInformation($"Удаление лайка комментария {commentId} пользователем {userId}");
                
                // Если userId не найден, пробуем получить email
                if (string.IsNullOrEmpty(userId))
                {
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(email))
                    {
                        userId = email;
                        _logger.LogInformation($"Используем email как идентификатор пользователя: {email}");
                    }
                }
                
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID не найден в токене при удалении лайка комментария");
                    return BadRequest("User ID not found in token");
                }
                
                await _likeService.UnlikeCommentAsync(userId, commentId);
                _logger.LogInformation($"Лайк комментария {commentId} успешно удален пользователем {userId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении лайка комментария {commentId}");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // GET: api/Likes/Debug
        [HttpGet("Debug")]
        [AllowAnonymous]
        public ActionResult<object> GetDebugInfo()
        {
            try
            {
                var userInfo = new Dictionary<string, string>();
                
                // Проверяем, аутентифицирован ли пользователь
                if (User.Identity?.IsAuthenticated == true)
                {
                    userInfo["IsAuthenticated"] = "true";
                    
                    // Попытка получить userId
                    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    userInfo["UserId"] = string.IsNullOrEmpty(userId) ? "Not found" : userId;
                    
                    // Попытка получить email
                    var email = User.FindFirstValue(ClaimTypes.Email);
                    userInfo["Email"] = string.IsNullOrEmpty(email) ? "Not found" : email;
                    
                    // Попытка получить имя пользователя
                    var name = User.FindFirstValue(ClaimTypes.Name);
                    userInfo["Name"] = string.IsNullOrEmpty(name) ? "Not found" : name;
                    
                    // Получаем все claims
                    userInfo["Claims"] = string.Join(", ", User.Claims.Select(c => $"{c.Type}: {c.Value}"));
                }
                else
                {
                    userInfo["IsAuthenticated"] = "false";
                    userInfo["Message"] = "User is not authenticated";
                }
                
                // Добавляем информацию о сервере
                userInfo["Server Time"] = DateTime.UtcNow.ToString();
                userInfo["Environment"] = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
                
                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отладочной информации");
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
} 