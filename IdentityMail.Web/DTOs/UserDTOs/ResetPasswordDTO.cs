using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.UserDTOs
{
    public class ResetPasswordDTO
    {
        public string? Email { get; set; }

        [Required(ErrorMessage = "Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen yeni bir şifre sıfırlama bağlantısı talep edin.")]
        public string? Token { get; set; }

        public string? Password { get; set; }

        public string? ConfirmPassword { get; set; }
    }
}