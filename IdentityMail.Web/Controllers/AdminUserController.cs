using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminUserController(UserManager<AppUser> _userManager) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index(string? search, string filter = "all", int page = 1)
        {
            const int pageSize = 10;

            page = Math.Max(1, page);

            var allUsers = _userManager.Users.AsQueryable();

            ViewBag.TotalUsers   = await allUsers.CountAsync();
            ViewBag.ActiveUsers  = await allUsers.CountAsync(x => x.IsActive == true);
            ViewBag.PassiveUsers = await allUsers.CountAsync(x => x.IsActive == false);

            var users = allUsers;

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();
                users  = users.Where(x => x.FirstName.Contains(search) || x.LastName.Contains(search) || (x.Email != null && x.Email.Contains(search)));
            }

            users = filter switch
            {
                "active"  => users.Where(x => x.IsActive == true),
                "passive" => users.Where(x => x.IsActive == false),
                _         => users
            };

            var totalFilteredUsers = await users.CountAsync();
            var totalPages         = Math.Max(1, (int)Math.Ceiling(totalFilteredUsers / (double)pageSize));

            page = Math.Min(page, totalPages);

            var model = await users
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ThenBy(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentSearch      = search;
            ViewBag.CurrentFilter      = filter;
            ViewBag.CurrentPage        = page;
            ViewBag.TotalPages         = totalPages;
            ViewBag.TotalFilteredUsers = totalFilteredUsers;
            ViewBag.PageSize           = pageSize;

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                return NotFound();
            }

            return Json(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.UserName,
                user.Email,
                user.ProfileImageURL,
                user.EmailConfirmed,
                user.IsActive
            });
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());

            if (user == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Kullanıcı bulunamadı."
                });
            }

            user.IsActive = !user.IsActive;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Kullanıcı durumu değiştirilemedi."
                });
            }

            if (user.IsActive != true)
            {
                var stampResult = await _userManager.UpdateSecurityStampAsync(user);

                if (!stampResult.Succeeded)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Kullanıcı pasife alındı ancak mevcut oturumları geçersiz kılınamadı."
                    });
                }
            }

            return Json(new
            {
                success  = true,
                isActive = user.IsActive,
                message  = user.IsActive == true ? "Kullanıcı aktifleştirildi." : "Kullanıcı pasife alındı."
            });
        }

    }
}