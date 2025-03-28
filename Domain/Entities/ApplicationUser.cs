using Microsoft.AspNetCore.Identity;

namespace NewsPortal.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime RegisterDate { get; set; }
        public bool IsBlocked { get; set; }
    }
}
