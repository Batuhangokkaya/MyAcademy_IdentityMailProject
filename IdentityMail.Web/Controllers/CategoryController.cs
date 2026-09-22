using IdentityMail.Web.Context;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize]
    public class CategoryController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public CategoryController(AppDbContext context, UserManager<AppUser> userManager)
        {
            _context     = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name);

            var categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return View(categories);
        }

        public async Task<IActionResult> Category(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

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
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var category = await _context.Categories.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (category == null)
                return NotFound();

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
        public async Task<IActionResult> Mails(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            { 
                return Unauthorized();
            }

            var category = await _context.Categories.FirstOrDefaultAsync(x => x.ID == id && x.UserID == user.Id);

            if (category == null)
            {
                return NotFound();
            }

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Category)
                .Where(x => x.ReceiverID == user.Id && x.CategoryID == id && x.IsDeletedReceiver == false)
                .OrderByDescending(x => x.ID)
                .ToListAsync();

            ViewBag.ActiveCategoryID = id;
            ViewBag.CategoryName     = category.Name;
            ViewBag.CategoryColor    = category.Color;

            ViewBag.Categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return View(messages);
        }

        
    }
}