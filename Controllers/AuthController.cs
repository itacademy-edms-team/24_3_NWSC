using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NewsPortal.Domain.Entities;
using NewsPortal.Domain.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace NewsPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            SignInManager<ApplicationUser> signInManager,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _configuration = configuration;
            _signInManager = signInManager;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                RegisterDate = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");
                return Ok(new { Message = "User registered successfully" });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                // Проверяем, заблокирован ли пользователь
                if (user.IsBlocked)
                {
                    var blockReason = !string.IsNullOrEmpty(user.BlockReason) 
                        ? user.BlockReason 
                        : "Аккаунт заблокирован администратором. Обратитесь в службу поддержки для получения дополнительной информации.";
                        
                    return BadRequest(new { 
                        Message = "Ваш аккаунт заблокирован администратором",
                        IsBlocked = true,
                        BlockReason = blockReason
                    });
                }

                var token = GenerateJwtToken(user);
                return Ok(new { 
                    Token = token,
                    LogoutUrl = Url.Action("Logout", "Auth", null, Request.Scheme),
                    User = new {
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName
                    }
                });
            }
            return Unauthorized();
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try 
            {
                _logger.LogInformation("Logout attempt started");
                _logger.LogInformation("Authorization header: {Header}", Request.Headers["Authorization"].ToString());
                
                // Получаем email из Claims
                var userEmailClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
                
                if (userEmailClaim == null)
                {
                    _logger.LogWarning("User identifier claim not found in token");
                    // Даже если не нашли email, возвращаем успешный результат
                    // JWT токены не имеют состояния на сервере, так что "logout" это просто
                    // удаление токена на стороне клиента
                    return Ok(new { 
                        Message = "Logged out successfully", 
                        LogoutTime = DateTime.UtcNow 
                    });
                }
                
                var userIdOrEmail = userEmailClaim.Value;
                _logger.LogInformation("User identifier from token: {Identifier}", userIdOrEmail);
                
                // В JWT токенах мы используем как NameIdentifier user.Id, а как Sub - email
                // Попробуем найти пользователя по ID или email
                ApplicationUser? user = null;
                
                // Проверяем формат - если это похоже на Guid, то это Id
                if (Guid.TryParse(userIdOrEmail, out _))
                {
                    user = await _userManager.FindByIdAsync(userIdOrEmail);
                }
                else
                {
                    // Иначе пробуем как email
                    user = await _userManager.FindByEmailAsync(userIdOrEmail);
                }
                
                if (user != null)
                {
                    _logger.LogInformation("Found user with email: {Email}", user.Email);
                    // JWT токены не имеют состояния на сервере, но мы можем подчистить 
                    // cookie-сессию если она есть
                    await _signInManager.SignOutAsync();
                    _logger.LogInformation("User successfully logged out from cookie session");
                }
                else
                {
                    _logger.LogWarning("User not found in database, but token is valid");
                }

                // Всегда возвращаем успех, так как клиент должен просто удалить токен
                return Ok(new { 
                    Message = "Logged out successfully",
                    Email = user?.Email,
                    LogoutTime = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout process");
                return StatusCode(500, new { Message = "Internal server error", Error = ex.Message });
            }
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                // Стандартные JWT-claims
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                
                // ASP.NET Identity claims
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email)
            };
            
            // Добавляем роли пользователя в claims
            var userRoles = _userManager.GetRolesAsync(user).Result;
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("role", role)); // Дублируем в более простом формате
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddHours(Convert.ToDouble(_configuration["Jwt:ExpirationHours"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
