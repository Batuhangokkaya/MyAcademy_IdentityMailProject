using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager,User")]
    public class NotificationController(UserManager<AppUser> _userManager,
                                        AppDbContext _context) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var notifications = await _context.Notifications
                .AsNoTracking()
                .Where(x => x.UserID == user.Id)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return View(notifications);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (notification == null)
            {
                return NotFound();
            }

            notification.IsRead = true;

            await _context.SaveChangesAsync();

            var unreadCount = await _context.Notifications.CountAsync(x => x.UserID == user.Id && !x.IsRead);

            return Json(new
            {
                success   = true,
                messageId = notification.MessageID,
                unreadCount
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            var notifications = await _context.Notifications
                .Where(x => x.UserID == user.Id && !x.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Json(new
            {
                success     = true,
                unreadCount = 0
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);

            await _context.SaveChangesAsync();

            var unreadCount = await _context.Notifications.CountAsync(x => x.UserID == user.Id && !x.IsRead);

            return Json(new
            {
                success = true,
                unreadCount
            });
        }
    }
}