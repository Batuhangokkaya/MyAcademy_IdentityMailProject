using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.ProfileDTOs
{
    public class ChangePasswordDTO
    {
        [Required(ErrorMessage = "Mevcut şifrenizi girin.")]
        public string CurrentPassword { get; set; }
        [Required(ErrorMessage = "Yeni şifrenizi girin.")]
        [DataType(DataType.Password)]
        public string NewPassword { get; set; }
        [Required(ErrorMessage = "Şifrenizi tekrar girin.")]
        [Compare(nameof(NewPassword), ErrorMessage = "Şifreler eşleşmiyor.")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
    }
}