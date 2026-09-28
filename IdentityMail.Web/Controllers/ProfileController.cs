using IdentityMail.Web.DTOs.ProfileDTOs;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager,User")]
    public class ProfileController(UserManager<AppUser> _userManager,
                                   IWebHostEnvironment _webHostEnvironment,
                                   SignInManager<AppUser> _signInManager) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var model = new ProfileDTO
            {
                FirstName       = user.FirstName,
                LastName        = user.LastName,
                UserName        = user.UserName,
                Email           = user.Email,
                ProfileImageURL = user.ProfileImageURL
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(ProfileDTO profileDTO)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            if (!ModelState.IsValid)
            {
                profileDTO.UserName        = user.UserName;
                profileDTO.Email           = user.Email;
                profileDTO.ProfileImageURL = user.ProfileImageURL;

                return View(profileDTO);
            }

            if (profileDTO.ProfileImage != null)
            {
                var image             = profileDTO.ProfileImage;
                var allowedExtensions = new[]{".jpg", ".jpeg", ".png", ".webp"};
                var extension         = Path.GetExtension(image.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension) || image.Length == 0 || image.Length > 2 * 1024 * 1024)
                {
                    ModelState.AddModelError("ProfileImage", "JPG, PNG veya WEBP formatında, en fazla 2 MB bir fotoğraf yükleyin.");

                    profileDTO.UserName        = user.UserName;
                    profileDTO.Email           = user.Email;
                    profileDTO.ProfileImageURL = user.ProfileImageURL;

                    return View(profileDTO);
                }

                var folder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "profiles");

                Directory.CreateDirectory(folder);

                var fileName = $"{Guid.NewGuid():N}{extension}";
                var filePath = Path.Combine(folder, fileName);

                await using (var stream = new FileStream(filePath, FileMode.CreateNew))
                {
                    await image.CopyToAsync(stream);
                }

                user.ProfileImageURL = $"/uploads/profiles/{fileName}";
            }

            user.FirstName = profileDTO.FirstName.Trim();
            user.LastName  = profileDTO.LastName.Trim();

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                profileDTO.UserName        = user.UserName;
                profileDTO.Email           = user.Email;
                profileDTO.ProfileImageURL = user.ProfileImageURL;

                return View(profileDTO);
            }

            TempData["ProfileSuccess"] = "Profil bilgileriniz başarıyla güncellendi.";

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Settings()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            ViewBag.CurrentUserName = user.UserName;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangeUsername(ChangeUsernameDTO changeUsernameDTO)
        {
            if (!ModelState.IsValid)
            {
                TempData["UsernameError"] = string.Join("|", ModelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage));

                return RedirectToAction(nameof(Settings));
            }

            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var newUsername  = changeUsernameDTO.UserName.Trim();
            var existingUser = await _userManager.FindByNameAsync(newUsername);

            if (existingUser != null && existingUser.Id != user.Id)
            {
                TempData["UsernameError"] = "Bu kullanıcı adı zaten kullanılıyor.";
                return RedirectToAction(nameof(Settings));
            }

            var result = await _userManager.SetUserNameAsync(user, newUsername);

            if (!result.Succeeded)
            {
                TempData["UsernameError"] = string.Join(" ", result.Errors.Select(x => x.Description));
                return RedirectToAction(nameof(Settings));
            }

            await _signInManager.RefreshSignInAsync(user);

            TempData["UsernameSuccess"] = "Kullanıcı adınız başarıyla güncellendi.";

            return RedirectToAction(nameof(Settings));
        }
       
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO changePasswordDTO)
        {
            if (!ModelState.IsValid)
            {
                TempData["PasswordError"] = "Şifre alanlarını kontrol edin.";
                return RedirectToAction(nameof(Settings));
            }

            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDTO.CurrentPassword, changePasswordDTO.NewPassword);

            if (!result.Succeeded)
            {
                TempData["PasswordError"] = string.Join("|", result.Errors.Select(x => x.Description));
                return RedirectToAction(nameof(Settings));
            }

            await _signInManager.RefreshSignInAsync(user);
            TempData["PasswordSuccess"] = "Şifreniz başarıyla değiştirildi.";

            return RedirectToAction(nameof(Settings));
        }
    }
}