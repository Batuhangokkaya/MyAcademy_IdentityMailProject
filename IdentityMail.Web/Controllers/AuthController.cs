using IdentityMail.Web.DTOs.UserDTOs;
using IdentityMail.Web.Entities;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MimeKit;

namespace IdentityMail.Web.Controllers
{
    [AllowAnonymous]
    public class AuthController(UserManager<AppUser> _userManager, SignInManager<AppUser> _signInManager, IConfiguration _configuration) : Controller
    {
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
            {
                return View(registerDTO);
            }

            var user = new AppUser
            {
                Email          = registerDTO.Email,
                FirstName      = registerDTO.FirstName,
                LastName       = registerDTO.LastName,
                UserName       = registerDTO.UserName,
                EmailConfirmed = false,
                IsActive       = true
            };

            var result = await _userManager.CreateAsync(user, registerDTO.Password!);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                return View(registerDTO);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "User");

            if (!roleResult.Succeeded)
            {
                foreach (var error in roleResult.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                return View(registerDTO);
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var confirmationLink = Url.Action("ConfirmEmail", "Auth",
                new {
                    userId = user.Id,
                    token  = token
                },
                Request.Scheme
            );

            var emailAddress  = _configuration["GmailSettings:Email"];
            var emailPassword = _configuration["GmailSettings:Password"];
            var emailHost     = _configuration["GmailSettings:Host"];
            var emailPort     = int.Parse(_configuration["GmailSettings:Port"]!);

            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("B-Mail", emailAddress));
            email.To.Add(MailboxAddress.Parse(user.Email));
            email.Subject = "B-Mail E-posta Doğrulama";

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = $@"
            <!DOCTYPE html>
            <html>
            <body style='margin:0;padding:0;background:#f5f7fb;'>
                <div style=' max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; padding:40px; font-family:Arial,sans-serif; text-align:center; border:1px solid #e5e7eb;'>
                    <h1 style='margin-bottom:25px; color:#0757C9;'>B-Mail</h1>
                    <h2 style='color:#111827; margin-bottom:15px;'>E-posta adresini doğrula</h2>
                    <p style='color:#64748b; line-height:1.6;'>Merhaba {user.FirstName}, B-Mail hesabını kullanmaya başlamak için e-posta adresini doğrulaman gerekiyor.</p>
                    <a href='{confirmationLink}' style=' display:inline-block; padding:14px 28px; margin:25px 0; background:#2563EB; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold;'>E-postamı Doğrula</a>
                    <p style=' color:#94a3b8; font-size:13px; line-height:1.6;'>Eğer bu hesabı sen oluşturmadıysan, bu e-postayı dikkate almayabilirsin.</p>
                    <hr style=' border:none; border-top:1px solid #e5e7eb;margin:25px 0;'>
                    <p style='color:#94a3b8; font-size:12px;'>© B-Mail</p>
                </div>

            </body>
            </html>";
            email.Body = bodyBuilder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(emailHost, emailPort, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(emailAddress, emailPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            ViewBag.EmailSent     = true;
            ViewBag.RegisterEmail = user.Email;

            ModelState.Clear();

            return View(new RegisterDTO());
        }

        [HttpGet]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            {
                TempData["EmailConfirmError"] = "E-posta doğrulama bağlantısı geçersiz.";
                return RedirectToAction("Login");
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                TempData["EmailConfirmError"] = "Kullanıcı bulunamadı.";
                return RedirectToAction("Login");
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);

            if (!result.Succeeded)
            {
                TempData["EmailConfirmError"] = "E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.";
                return RedirectToAction("Login");
            }

            TempData["EmailConfirmedSuccess"] = true;
            return RedirectToAction("Login");
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            if (string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
            {
                ModelState.AddModelError(string.Empty, "Lütfen E-Posta ve Şifre alanlarını doldurun.");
                return View(loginDTO);
            }

            var user = await _userManager.FindByEmailAsync(loginDTO.Email);

            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Bu E-Mail sistemde kayıtlı değil.");
                return View(loginDTO);
            }

            if (user.IsActive == null)
            {
                ModelState.AddModelError(string.Empty, "Hesabınız pasif durumdadır. Lütfen destek ekibiyle iletişime geçin.");
                return View(loginDTO);
            }

            if (!user.EmailConfirmed)
            {
                ModelState.AddModelError(string.Empty, "E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanıza gönderilen doğrulama bağlantısına tıklayın.");
                return View(loginDTO);
            }

            var result = await _signInManager.PasswordSignInAsync(user, loginDTO.Password, loginDTO.RememberMe, false);

            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "Email veya Şifre hatalı");
                return View(loginDTO);
            }

            return RedirectToAction("Inbox", "Message");
        }

        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Login", "Auth");
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDTO forgotPasswordDTO)
        {
            if (!ModelState.IsValid)
            {
                return View(forgotPasswordDTO);
            }

            var user = await _userManager.FindByEmailAsync(forgotPasswordDTO.Email);

            if (user == null)
            {
                TempData["SuccessMessage"] = "E-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı e-posta adresinize gelecektir.";
                return RedirectToAction(nameof(ForgotPassword));
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = Url.Action("ResetPassword", "Auth",
                new
                {
                    email = user.Email,
                    token = token
                },
                Request.Scheme);

            var emailAddress  = _configuration["GmailSettings:Email"];
            var emailPassword = _configuration["GmailSettings:Password"];
            var emailHost     = _configuration["GmailSettings:Host"];
            var emailPort     = int.Parse(_configuration["GmailSettings:Port"]);

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("B-Mail",emailAddress));
            email.To.Add(MailboxAddress.Parse(user.Email));
            email.Subject = "B-Mail Şifre Sıfırlama";

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = $@"
            <!DOCTYPE html>
            <html>
            <body>
                <div style='max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 40px; font-family: Arial, sans-serif; text-align: center; border: 1px solid #e5e7eb;'>
                    <h1 style='color:#0757C9;'>B-Mail</h1>
                    <h2>Şifreni mi unuttun?</h2>
                    <p style='color:#555;'>Hesabının şifresini sıfırlamak için aşağıdaki butona tıklayabilirsin.</p>
                    <a href='{resetLink}' style='display:inline-block; padding:14px 28px; background:#2563EB; color:white; text-decoration:none; border-radius:8px; font-weight:bold; margin:20px 0;'>Şifremi Sıfırla</a>
                    <p style='color:#777; font-size:13px;'>Bu isteği sen yapmadıysan bu e-postayı dikkate almayabilirsin.</p>
                    <hr style='border:none;border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:12px;'>© B-Mail</p>
                </div>
            </body>
            </html>
            ";

            email.Body = bodyBuilder.ToMessageBody();
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(emailHost, emailPort, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(emailAddress, emailPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            TempData["SuccessMessage"] = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.";
            return RedirectToAction(nameof(ForgotPassword));
        }

        [HttpGet]
        public IActionResult ResetPassword(string email, string token)
        {
            var resetPasswordDTO = new ResetPasswordDTO
            {
                Email = email,
                Token = token
            };

            return View(resetPasswordDTO);
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO resetPasswordDTO)
        {
            if (string.IsNullOrEmpty(resetPasswordDTO.Password) || string.IsNullOrEmpty(resetPasswordDTO.ConfirmPassword))
            {
                ModelState.AddModelError(
                    string.Empty,
                    "Şifre ve Şifre Tekrar alanı zorunludur!");

                return View(resetPasswordDTO);
            }

            if (resetPasswordDTO.Password != resetPasswordDTO.ConfirmPassword)
            {
                ModelState.AddModelError(
                    string.Empty,
                    "Şifreler birbiriyle uyumlu değil!");

                return View(resetPasswordDTO);
            }

            if (!ModelState.IsValid)
            {
                return View(resetPasswordDTO);
            }

            var user = await _userManager.FindByEmailAsync(resetPasswordDTO.Email);

            if (user == null)
            {
                return View(resetPasswordDTO);
            }

            var result = await _userManager.ResetPasswordAsync(user, resetPasswordDTO.Token, resetPasswordDTO.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(
                        string.Empty,
                        error.Description);
                }

                return View(resetPasswordDTO);
            }

            ViewBag.PasswordResetSuccess = true;

            return View(resetPasswordDTO);
        }
    }
}