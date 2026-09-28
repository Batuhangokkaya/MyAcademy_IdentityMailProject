using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager,User")]
    public class CategoryController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public CategoryController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context     = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

            var query = _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name);

            var totalCategories = await query.CountAsync();
            var totalPages      = (int)Math.Ceiling(totalCategories / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var categories = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage     = page;
            ViewBag.TotalPages      = totalPages;
            ViewBag.TotalCategories = totalCategories;

            return View(categories);
        }

        public async Task<IActionResult> Category(int id)
        {
            var user     = await _userManager.FindByNameAsync(User.Identity.Name);
            var category = await _context.Categories.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (category == null)
            {
                return NotFound();
            }

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.CategoryID == id && (x.ReceiverID == user.Id || x.SenderID == user.Id))
                .ToListAsync();

            ViewBag.ActiveCategoryID = id;

            return View(messages);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Category category)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var allowedColors = new[]
            {
                "#2563EB",
                "#EF4444",
                "#F97316",
                "#F59E0B",
                "#22C55E",
                "#14B8A6",
                "#13aff0",
                "#8B5CF6",
                "#EC4899",
                "#64748B"
            };

            if (string.IsNullOrEmpty(category.Color) || !allowedColors.Contains(category.Color))
            {
                category.Color = "#2563EB";
            }

            category.UserID = user.Id;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return RedirectToAction("Index", "Category");
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var user     = await _userManager.FindByNameAsync(User.Identity.Name);
            var category = await _context.Categories.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (category == null)
            {
                return NotFound();
            }

            return View(category);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(Category category)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var existingCategory = await _context.Categories.FirstOrDefaultAsync(x => x.ID == category.ID && x.UserID == user.Id);

            if (existingCategory == null)
            {
                return NotFound();
            }

            var allowedColors = new[]
            {
                "#2563EB",
                "#EF4444",
                "#F97316",
                "#F59E0B",
                "#22C55E",
                "#14B8A6",
                "#13aff0",
                "#8B5CF6",
                "#EC4899",
                "#64748B"
            };

            if (string.IsNullOrEmpty(category.Color) || !allowedColors.Contains(category.Color))
            {
                category.Color = "#2563EB";
            }

            existingCategory.Name  = category.Name;
            existingCategory.Color = category.Color;

            await _context.SaveChangesAsync();

            return RedirectToAction("Index", "Category");
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return RedirectToAction("Index", "Category");
        }

        [HttpGet]
        public async Task<IActionResult> Mails(int id, int page = 1)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

            var category = await _context.Categories.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (category == null)
            {
                return NotFound();
            }

            var query = _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.CategoryID == id && ((x.ReceiverID == user.Id && x.IsDeletedReceiver == false) || (x.SenderID == user.Id && x.IsDeletedSender == false)))
                .OrderByDescending(x => x.ID);

            var totalMessages = await query.CountAsync();
            var totalPages    = (int)Math.Ceiling(totalMessages / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var messages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.ActiveCategoryID = id;
            ViewBag.CategoryName     = category.Name;
            ViewBag.CategoryColor    = category.Color;
            ViewBag.CurrentPage      = page;
            ViewBag.TotalPages       = totalPages;
            ViewBag.TotalMessages    = totalMessages;
            ViewBag.Categories       = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return View(messages);
        }
    }
}