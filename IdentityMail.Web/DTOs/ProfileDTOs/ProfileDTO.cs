using System.ComponentModel.DataAnnotations;

namespace IdentityMail.Web.DTOs.ProfileDTOs
{
    public class ProfileDTO
    {
        [Required(ErrorMessage = "Ad alanı zorunludur.")]
        [StringLength(50)]
        public string FirstName { get; set; }
        [Required(ErrorMessage = "Soyad alanı zorunludur.")]
        [StringLength(50)]
        public string LastName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? ProfileImageURL { get; set; }
        public IFormFile? ProfileImage { get; set; }
    }
}