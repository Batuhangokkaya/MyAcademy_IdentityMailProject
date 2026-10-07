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
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz!")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "Kullanıcı Adı alanı zorunludur!")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Şifre alanı zorunludur!")]
        public string? Password { get; set; }
        [Required(ErrorMessage = "Şifre Tekrar alanı zorunludur!")]
        [Compare("Password", ErrorMessage = "Şifreler birbiriyle uyumlu değil!")]
        public string? ConfirmPassword { get; set; }
    }
}