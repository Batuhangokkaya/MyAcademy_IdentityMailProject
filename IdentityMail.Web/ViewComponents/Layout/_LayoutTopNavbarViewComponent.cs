using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutTopNavbarViewComponent(UserManager<AppUser> _userManager,
                                               AppDbContext _context) : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            var user = await _userManager.GetUserAsync(HttpContext.User);

            if (user == null)
            {
                ViewBag.UnreadNotificationCount = 0;
                return View(new List<Notification>());
            }

            var notifications = await _context.Notifications
                .AsNoTracking()
                .Where(x => x.UserID == user.Id)
                .OrderByDescending(x => x.CreatedAt)
                .Take(10)
                .ToListAsync();
            
            ViewBag.UnreadNotificationCount = await _context.Notifications.CountAsync(x => x.UserID == user.Id && !x.IsRead);
            ViewBag.ProfileName             = $"{user.FirstName} {user.LastName}".Trim();
            ViewBag.ProfileEmail            = user.Email;
            ViewBag.ProfileImage            = user.ProfileImageURL;
            ViewBag.ProfileInitial          = !string.IsNullOrWhiteSpace(user.FirstName) ? user.FirstName.Substring(0, 1).ToUpper() : "?";

            return View(notifications);
        }
    }
}