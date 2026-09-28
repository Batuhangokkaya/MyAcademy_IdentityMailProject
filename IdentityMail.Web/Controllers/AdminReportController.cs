using IdentityMail.Web.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager")]
    public class AdminReportController(AppDbContext _context) : Controller
    {
        [HttpGet]
        public async Task<IActionResult> Index(int page = 1)
        {
            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

            var query = _context.MessageReports
                .AsNoTracking()
                .Include(x => x.Message)
                .ThenInclude(x => x.Sender)
                .Include(x => x.Message)
                .ThenInclude(x => x.Receiver)
                .Include(x => x.ReporterUser)
                .OrderByDescending(x => x.CreatedAt);

            var totalReports = await query.CountAsync();
            var totalPages   = (int)Math.Ceiling(totalReports / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var reports = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage  = page;
            ViewBag.TotalPages   = totalPages;
            ViewBag.TotalReports = totalReports;

            return View(reports);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveReport(int id)
        {
            var report = await _context.MessageReports.FirstOrDefaultAsync(x => x.ID == id);

            if (report == null)
            {
                return NotFound();
            }

            _context.MessageReports.Remove(report);

            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Şikayet kaydı kaldırıldı.";

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var report = await _context.MessageReports
                .Include(x => x.Message)
                .FirstOrDefaultAsync(x => x.ID == id);

            if (report == null)
            {
                return NotFound();
            }

            if (report.Message != null)
            {
                report.Message.IsDeletedSender   = true;
                report.Message.IsDeletedReceiver = true;
            }

            var messageReports = await _context.MessageReports
                .Where(x => x.MessageID == report.MessageID)
                .ToListAsync();

            _context.MessageReports.RemoveRange(messageReports);

            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Mesaj çöp kutusuna taşındı ve şikayet kaldırıldı.";

            return RedirectToAction("Index");
        }
    }
}