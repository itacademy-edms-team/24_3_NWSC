using System;
using System.Collections.Generic;

namespace NewsPortal.Application.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime RegisterDate { get; set; }
        public bool IsBlocked { get; set; }
        public bool EmailConfirmed { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public int ArticlesCount { get; set; }
        public int CommentsCount { get; set; }
    }
    
    public class UserListDto
    {
        public List<UserDto> Users { get; set; } = new List<UserDto>();
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
    
    public class BlockUserDto
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsBlocked { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
    
    public class UpdateUserRolesDto
    {
        public string UserId { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
    }
} 