using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using IdentityMail.Web.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutSideNavbarViewComponent(UserManager<AppUser> _userManager, AppDbContext _context) : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            // Gelen Mailler
            var totalInbox = await _context.UserMessages.CountAsync(x => x.ReceiverID == user.Id && x.IsDeletedReceiver == false);
                
            ViewBag.TotalInbox = totalInbox;

            // Gönderilen Mailler
            var totalSentMail = await _context.UserMessages.CountAsync(x => x.SenderID == user.Id && x.IsDeletedSender == false);
            ViewBag.TotalSentMail = totalSentMail;

            // Taslaklar
            var totalDrafts = await _context.UserMessages.CountAsync(x => x.SenderID == user.Id && x.IsDraft == true && x.IsDeletedSender == false);
            ViewBag.TotalDraft = totalDrafts;

            // Önemli Mailler
            var totalImportantMail = await _context.UserMessages.CountAsync(x => x.SenderID == user.Id && x.IsImportant == true && x.IsDeletedSender == false);
            ViewBag.TotalImportantMail = totalImportantMail;

            // Silinen Mailler
            var totalDeletedMails = await _context.UserMessages.CountAsync(x => (x.SenderID == user.Id && x.IsDeletedSender && !x.IsTrashEmptiedSender) || (x.ReceiverID == user.Id && x.IsDeletedReceiver && !x.IsTrashEmptiedReceiver));
            ViewBag.TotalDeletedMail = totalDeletedMails;

            // Kategoriler
            var totalCategory = await _context.Categories.CountAsync(x => x.UserID == user.Id);
            ViewBag.TotalCategory = totalCategory;

            var categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .ToListAsync();

            ViewBag.Categories = categories;

            return View(new SideNavbarViewModel
            {
                DeletedMessages = totalDeletedMails,
                Categories      = categories
            });
        }
    }
}