using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager")]
    public class StatisticsController(AppDbContext _context,
                                      UserManager<AppUser> _userManager,
                                      RoleManager<AppRole> _roleManager) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewBag.TotalUsers     = await _userManager.Users.CountAsync();
            ViewBag.ActiveUsers    = await _userManager.Users.CountAsync(x => x.IsActive == true);
            ViewBag.PassiveUsers   = await _userManager.Users.CountAsync(x => x.IsActive == false);
            ViewBag.TotalMessages  = await _context.UserMessages.CountAsync(x => !x.IsDraft);
            ViewBag.TotalDrafts    = await _context.UserMessages.CountAsync(x => x.IsDraft);
            ViewBag.UnreadMessages = await _context.UserMessages.CountAsync(x => !x.IsDraft && !x.IsRead);
            ViewBag.TotalRoles     = await _roleManager.Roles.CountAsync();

            var senderTrashCount   = await _context.UserMessages.CountAsync(x => x.IsDeletedSender == true && x.IsTrashEmptiedSender == false);
            var receiverTrashCount = await _context.UserMessages.CountAsync(x => x.IsDeletedReceiver == true && x.IsTrashEmptiedReceiver == false);

            ViewBag.TrashMessages = senderTrashCount + receiverTrashCount;

            var today    = DateTime.Today;
            var tomorrow = today.AddDays(1);

            ViewBag.TodayMessages = await _context.UserMessages.CountAsync(x => !x.IsDraft && x.SendDate >= today && x.SendDate < tomorrow);

            var topSender = await _context.UserMessages
                .AsNoTracking()
                .Where(x => !x.IsDraft && x.SenderID != null)
                .GroupBy(x => new { x.Sender.FirstName, x.Sender.LastName })
                .Select(x => new
                {
                    Name = (x.Key.FirstName + " " + x.Key.LastName).Trim(),
                    Count = x.Count()
                })
                .OrderByDescending(x => x.Count)
                .FirstOrDefaultAsync();

            ViewBag.TopSenderName  = topSender != null ? topSender.Name : "Yok";
            ViewBag.TopSenderCount = topSender != null ? topSender.Count : 0;

            var topCategory = await _context.UserMessages
                .AsNoTracking()
                .Where(x => !x.IsDraft && x.CategoryID != null)
                .GroupBy(x => x.Category.Name)
                .Select(x => new
                {
                    Name = x.Key,
                    Count = x.Count()
                })
                .OrderByDescending(x => x.Count)
                .FirstOrDefaultAsync();

            ViewBag.TopCategoryName  = topCategory != null ? topCategory.Name : "Yok";
            ViewBag.TopCategoryCount = topCategory != null ? topCategory.Count : 0;

            var startDate   = today.AddDays(-6);
            var chartLabels = new List<string>();
            var chartValues = new List<int>();
            var messages    = await _context.UserMessages
                .AsNoTracking()
                .Where(x => !x.IsDraft && x.SendDate >= startDate && x.SendDate < tomorrow)
                .GroupBy(x => x.SendDate.Date)
                .Select(x => new
                {
                    Date  = x.Key,
                    Count = x.Count()
                })
                .ToListAsync();

            for (var i = 0; i < 7; i++)
            {
                var date = startDate.AddDays(i);

                chartLabels.Add(date.ToString("dd MMM", new System.Globalization.CultureInfo("tr-TR")));
                chartValues.Add(messages.FirstOrDefault(x => x.Date == date)?.Count ?? 0);
            }

            ViewBag.ChartLabels = chartLabels;
            ViewBag.ChartValues = chartValues;

            return View();
        }
    }
}