using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminRoleController(RoleManager<AppRole> _roleManager,
                                     UserManager<AppUser> _userManager) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

            var query = _roleManager.Roles.OrderBy(x => x.Name);

            var totalRoles = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRoles / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var roles = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages  = totalPages;
            ViewBag.TotalRoles  = totalRoles;

            return View(roles);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(string? roleName)
        {
            roleName = roleName?.Trim() ?? "";

            if (string.IsNullOrWhiteSpace(roleName))
            {
                TempData["RoleError"] = "Rol adı boş bırakılamaz.";
                return RedirectToAction(nameof(Index));
            }

            if (await _roleManager.RoleExistsAsync(roleName))
            {
                TempData["RoleError"] = "Bu rol zaten mevcut.";
                return RedirectToAction(nameof(Index));
            }

            var role = new AppRole
            {
                Name = roleName
            };

            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                TempData["RoleError"] = string.Join(" ", result.Errors.Select(x => x.Description));
                return RedirectToAction(nameof(Index));
            }

            TempData["RoleSuccess"] = "Rol başarıyla oluşturuldu.";

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, string? roleName)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                return NotFound();
            }

            roleName = roleName?.Trim() ?? "";

            if (string.IsNullOrWhiteSpace(roleName))
            {
                TempData["RoleError"] = "Rol adı boş bırakılamaz.";
                return RedirectToAction(nameof(Index));
            }

            if (role.Name == "Admin" || role.Name == "User")
            {
                if (!string.Equals(role.Name, roleName, StringComparison.OrdinalIgnoreCase))
                {
                    TempData["RoleError"] = "Admin ve User rollerinin adları değiştirilemez.";
                    return RedirectToAction(nameof(Index));
                }
            }

            var existingRole = await _roleManager.FindByNameAsync(roleName);

            if (existingRole != null && existingRole.Id != id)
            {
                TempData["RoleError"] = "Bu isimde başka bir rol mevcut.";
                return RedirectToAction(nameof(Index));
            }

            role.Name = roleName;

            var result = await _roleManager.UpdateAsync(role);

            if (!result.Succeeded)
            {
                TempData["RoleError"] = string.Join(" ", result.Errors.Select(x => x.Description));
                return RedirectToAction(nameof(Index));
            }

            TempData["RoleSuccess"] = "Rol başarıyla güncellendi.";

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ToListAsync();

            var result = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);

                result.Add(new
                {
                    id              = user.Id,
                    fullName        = $"{user.FirstName} {user.LastName}".Trim(),
                    email           = user.Email,
                    profileImageURL = user.ProfileImageURL,
                    roles           = roles
                });
            }

            return Json(result);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AssignRole(int userID, int roleID)
        {
            var user = await _userManager.FindByIdAsync(userID.ToString());
            var role = await _roleManager.FindByIdAsync(roleID.ToString());

            if (user == null || role == null || string.IsNullOrWhiteSpace(role.Name))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Kullanıcı veya rol bulunamadı."
                });
            }

            if (await _userManager.IsInRoleAsync(user, role.Name))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Kullanıcı zaten bu role sahip."
                });
            }

            var result = await _userManager.AddToRoleAsync(user, role.Name);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = string.Join(" ", result.Errors.Select(x => x.Description))
                });
            }

            var stampResult = await _userManager.UpdateSecurityStampAsync(user);

            if (!stampResult.Succeeded)
            {
                return Json(new
                {
                    success = true,
                    message = "Rol atandı ancak oturum yenileme işlemi başarısız oldu."
                });
            }

            return Json(new
            {
                success = true,
                message = "Rol başarıyla atandı."
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveRole(int userID, int roleID)
        {
            var user = await _userManager.FindByIdAsync(userID.ToString());
            var role = await _roleManager.FindByIdAsync(roleID.ToString());

            if (user == null || role == null || string.IsNullOrWhiteSpace(role.Name))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Kullanıcı veya rol bulunamadı."
                });
            }

            if (!await _userManager.IsInRoleAsync(user, role.Name))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Kullanıcı bu role sahip değil."
                });
            }

            if (string.Equals(role.Name, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                var admins = await _userManager.GetUsersInRoleAsync(role.Name);

                if (admins.Count <= 1)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Sistemdeki son Admin'in rolü kaldırılamaz."
                    });
                }
            }

            var result = await _userManager.RemoveFromRoleAsync(user, role.Name);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    success = false,
                    message = string.Join(" ", result.Errors.Select(x => x.Description))
                });
            }

            var stampResult = await _userManager.UpdateSecurityStampAsync(user);

            if (!stampResult.Succeeded)
            {
                return Json(new
                {
                    success = true,
                    message = "Rol kaldırıldı ancak oturum yenileme işlemi başarısız oldu."
                });
            }

            return Json(new
            {
                success = true,
                message = "Rol başarıyla kaldırıldı."
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());

            if (role == null)
            {
                TempData["RoleError"] = "Silinecek rol bulunamadı.";
                return RedirectToAction(nameof(Index));
            }

            if (string.Equals(role.Name, "Admin", StringComparison.OrdinalIgnoreCase) || string.Equals(role.Name, "User", StringComparison.OrdinalIgnoreCase))
            {
                TempData["RoleError"] = "Admin ve User sistem rolleri silinemez.";
                return RedirectToAction(nameof(Index));
            }

            var users = await _userManager.GetUsersInRoleAsync(role.Name!);

            if (users.Count > 0)
            {
                TempData["RoleError"] = "Bu role atanmış kullanıcılar var. Önce kullanıcıların rollerini kaldırın.";
                return RedirectToAction(nameof(Index));
            }

            var result = await _roleManager.DeleteAsync(role);

            if (!result.Succeeded)
            {
                TempData["RoleError"] = string.Join(" ", result.Errors.Select(x => x.Description));
                return RedirectToAction(nameof(Index));
            }

            TempData["RoleSuccess"] = "Rol başarıyla silindi.";

            return RedirectToAction(nameof(Index));
        }
    }
}