using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NWSC.Controllers
{
    [Route("api/health")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new { status = "ok", message = "API Server is running", timestamp = DateTime.UtcNow });
        }
        
        // Дополнительный эндпоинт для сложной проверки работоспособности
        [HttpGet("check")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            try
            {
                // Здесь можно добавить более сложные проверки, например:
                // - Проверку подключения к базе данных
                // - Проверку доступности других сервисов
                // - Проверку наличия определенных файлов и т.д.
                
                // Возвращаем расширенную информацию
                return Ok(new { 
                    status = "healthy", 
                    message = "All systems operational",
                    version = "1.0",
                    server_time = DateTime.UtcNow,
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
                    memory_usage = GC.GetTotalMemory(false) / (1024 * 1024) + " MB" // Примерное использование памяти в МБ
                });
            }
            catch (Exception ex)
            {
                // Если что-то пошло не так, возвращаем информацию об ошибке
                return StatusCode(500, new { 
                    status = "unhealthy", 
                    message = "System check failed",
                    error = ex.Message
                });
            }
        }
    }
}
