using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.UserDTOs
{
    public class ForgotPasswordDTO
    {
        [Required(ErrorMessage = "E-posta alanı zorunludur!")]
        public string? Email { get; set; }
    }
}