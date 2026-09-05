using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.UserDTOs
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "Ad alanı zorunludur!")]
        public string? FirstName { get; set; }
        [Required(ErrorMessage = "Soyad alanı zorunludur!")]
        public string? LastName { get; set; }
        [Required(ErrorMessage = "E-posta alanı zorunludur!")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "Kullanıcı Adı alanı zorunludur!")]
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}