using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.ProfileDTOs
{
    public class ChangeUsernameDTO
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
        [StringLength(30, MinimumLength = 3, ErrorMessage = "Kullanıcı adı 2-30 karakter olmalıdır.")]
        public string UserName { get; set; }
    }
}