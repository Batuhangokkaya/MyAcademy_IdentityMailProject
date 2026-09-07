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
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterDTO registerDTO)
        {
            if (string.IsNullOrEmpty(registerDTO.Password) || string.IsNullOrEmpty(registerDTO.ConfirmPassword))
            {
                ModelState.AddModelError(string.Empty, "Şifre ve Şifre Tekrar alanı zorunludur!");
                return View(registerDTO);
            }

            if (registerDTO.Password != registerDTO.ConfirmPassword)
            {
                ModelState.AddModelError(string.Empty, "Şifreler birbiriyle uyumlu değil!");
                return View(registerDTO);
            }

            var user = new AppUser
            {
                Email     = registerDTO.Email,
                FirstName = registerDTO.FirstName,
                LastName  = registerDTO.LastName,
                UserName  = registerDTO.UserName,
            };

            var result = await _userManager.CreateAsync(user, registerDTO.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }

                return View(registerDTO);
            }

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

            var resetLink = Url.Action(
                "ResetPassword",
                "Auth",
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
            var bodyBuilder = new BodyBuilder();

            bodyBuilder.HtmlBody = $@"
            <!DOCTYPE html>
            <html>
            <body>
                <div style='
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 40px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    border: 1px solid #e5e7eb;'>
                    <h1 style='color:#0757C9;'>
                        B-Mail
                    </h1>
                    <h2>
                        Şifreni mi unuttun?
                    </h2>
                    <p style='color:#555;'>
                        Hesabının şifresini sıfırlamak için
                        aşağıdaki butona tıklayabilirsin.
                    </p>
                    <a href='{resetLink}'
                       style='
                           display:inline-block;
                           padding:14px 28px;
                           background:#2563EB;
                           color:white;
                           text-decoration:none;
                           border-radius:8px;
                           font-weight:bold;
                           margin:20px 0;
                       '>
                        Şifremi Sıfırla
                    </a>
                    <p style='color:#777; font-size:13px;'>
                        Bu isteği sen yapmadıysan bu e-postayı
                        dikkate almayabilirsin.
                    </p>
                    <hr style='border:none;border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:12px;'>
                        © B-Mail
                    </p>
                </div>
            </body>
            </html>
            ";

            email.Body = bodyBuilder.ToMessageBody();
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
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

            var result = await _userManager.ResetPasswordAsync(
                user,
                resetPasswordDTO.Token,
                resetPasswordDTO.Password);

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