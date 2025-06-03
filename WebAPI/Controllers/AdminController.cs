using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NewsPortal.Application.Services;
using NewsPortal.Application.DTOs;
using System.Threading.Tasks;

namespace NewsPortal.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;
        private readonly ArticleService _articleService;

        public AdminController(AdminService adminService, ArticleService articleService)
        {
            _adminService = adminService;
            _articleService = articleService;
        }

        // Статистика
        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsDto>> GetStats()
        {
            try
            {
                var stats = await _adminService.GetStatsAsync();
                return Ok(stats);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при получении статистики", error = ex.Message });
            }
        }

        // Управление пользователями
        [HttpGet("users")]
        public async Task<ActionResult<UserListDto>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = null)
        {
            try
            {
                var users = await _adminService.GetUsersAsync(page, pageSize, searchTerm);
                return Ok(users);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при получении пользователей", error = ex.Message });
            }
        }

        [HttpPost("users/block")]
        public async Task<ActionResult> BlockUser([FromBody] BlockUserDto blockUserDto)
        {
            try
            {
                var result = await _adminService.BlockUserAsync(blockUserDto);
                if (result)
                {
                    return Ok(new { message = blockUserDto.IsBlocked ? "Пользователь заблокирован" : "Пользователь разблокирован" });
                }
                return BadRequest(new { message = "Не удалось изменить статус пользователя" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при блокировке пользователя", error = ex.Message });
            }
        }

        [HttpPost("users/roles")]
        public async Task<ActionResult> UpdateUserRoles([FromBody] UpdateUserRolesDto updateRolesDto)
        {
            try
            {
                var result = await _adminService.UpdateUserRolesAsync(updateRolesDto);
                if (result)
                {
                    return Ok(new { message = "Роли пользователя обновлены" });
                }
                return BadRequest(new { message = "Не удалось обновить роли пользователя" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при обновлении ролей", error = ex.Message });
            }
        }

        [HttpDelete("users/{userId}")]
        public async Task<ActionResult> DeleteUser(string userId)
        {
            try
            {
                var result = await _adminService.DeleteUserAsync(userId);
                if (result)
                {
                    return Ok(new { message = "Пользователь удален" });
                }
                return BadRequest(new { message = "Не удалось удалить пользователя" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при удалении пользователя", error = ex.Message });
            }
        }

        // Управление статьями
        [HttpGet("articles")]
        public async Task<ActionResult<ArticleListDto>> GetArticlesForModeration([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = null)
        {
            try
            {
                var articles = await _adminService.GetArticlesForModerationAsync(page, pageSize, searchTerm);
                return Ok(articles);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при получении статей", error = ex.Message });
            }
        }

        [HttpDelete("articles/{articleId}")]
        public async Task<ActionResult> DeleteArticle(int articleId)
        {
            try
            {
                await _articleService.DeleteArticleAsync(articleId);
                return Ok(new { message = "Статья удалена" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при удалении статьи", error = ex.Message });
            }
        }

        // Управление комментариями
        [HttpGet("comments")]
        public async Task<ActionResult<CommentListDto>> GetCommentsForModeration([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var comments = await _adminService.GetCommentsForModerationAsync(page, pageSize);
                return Ok(comments);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при получении комментариев", error = ex.Message });
            }
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<ActionResult> DeleteComment(int commentId)
        {
            try
            {
                var result = await _adminService.DeleteCommentAsync(commentId);
                if (result)
                {
                    return Ok(new { message = "Комментарий удален" });
                }
                return BadRequest(new { message = "Не удалось удалить комментарий" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Ошибка при удалении комментария", error = ex.Message });
            }
        }
    }
} 