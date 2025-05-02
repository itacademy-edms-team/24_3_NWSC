using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NewsPortal.Application.DTOs;
using NewsPortal.Application.Services;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace NewsPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;

        public CommentsController(CommentService commentService)
        {
            _commentService = commentService;
        }

        // GET: api/Comments/Article/5
        [HttpGet("Article/{articleId}")]
        public async Task<ActionResult<CommentListDto>> GetArticleComments(
            int articleId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var comments = await _commentService.GetArticleCommentsAsync(articleId, page, pageSize);
            return Ok(comments);
        }

        // GET: api/Comments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentDto>> GetComment(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

        // POST: api/Comments
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CommentDto>> CreateComment(CreateCommentDto createCommentDto)
        {
            try
            {
                // Если поле authorId не заполнено, берем ID пользователя из токена
                if (string.IsNullOrEmpty(createCommentDto.AuthorId))
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null)
                    {
                        createCommentDto.AuthorId = userIdClaim.Value;
                    }
                    else
                    {
                        // Если не удалось получить ID из токена, пробуем получить email
                        var emailClaim = User.FindFirst(ClaimTypes.Email) ?? User.FindFirst(JwtRegisteredClaimNames.Email);
                        if (emailClaim != null)
                        {
                            createCommentDto.AuthorId = emailClaim.Value;
                        }
                        else
                        {
                            return BadRequest("Не удалось определить пользователя из токена");
                        }
                    }
                }
                
                var comment = await _commentService.CreateCommentAsync(createCommentDto);
                return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, comment);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // PUT: api/Comments/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, UpdateCommentDto updateCommentDto)
        {
            var comment = await _commentService.UpdateCommentAsync(id, updateCommentDto);

            if (comment == null)
            {
                return NotFound();
            }

            return Ok(comment);
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
            {
                return NotFound();
            }

            await _commentService.DeleteCommentAsync(id);
            return NoContent();
        }
    }
} 