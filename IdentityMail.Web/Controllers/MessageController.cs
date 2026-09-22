using IdentityMail.Web.Context;
using IdentityMail.Web.DTOs.UserMessageDTOs;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize]
    public class MessageController(UserManager<AppUser> _userManager,
                                   AppDbContext _context) : Controller
    {
        public async Task<IActionResult> Inbox(string filter = "all", string sort = "new", int? categoryId = null)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var messages = _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Category)
                .OrderByDescending(x => x.ID)
                .Where(x => x.ReceiverID == user.Id && x.IsDeletedReceiver == false)
                .AsQueryable();

            ViewBag.Categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            if (filter == "unread")
            {
                messages = messages.Where(x => x.IsRead == false);
            }
            else if (filter == "read")
            {
                messages = messages.Where(x => x.IsRead == true);
            }
            ViewBag.CurrentFilter = filter;

            if (sort == "new")
            {
                messages = messages.OrderByDescending(x => x.SendDate);
            }
            else if(sort == "old")
            {
                messages = messages.OrderBy(x => x.SendDate);
            }
            ViewBag.CurrentSort = sort;

            if (categoryId.HasValue)
            {
                messages = messages.Where(x => x.CategoryID == categoryId.Value);
            }

            ViewBag.CurrentCategoryId = categoryId;

            var query = await messages.ToListAsync();

            var unreadMessages = await _context.UserMessages
                .Include(x => x.Sender)
                .Where(x => x.ReceiverID == user.Id && x.IsRead == false && x.IsDeletedReceiver == false)
                .CountAsync();
            ViewBag.UnreadMessages = unreadMessages;

            return View(query);
        }

        public async Task<IActionResult> SentMails(string sort = "new", int? categoryId = null)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var query = _context.UserMessages
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.SenderID == user.Id && x.IsDeletedSender == false)
                .AsQueryable();

            ViewBag.Categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            if (sort == "old")
            {
                query = query.OrderBy(x => x.SendDate);
            }
            else
            {
                query = query.OrderByDescending(x => x.SendDate);
            }
            ViewBag.CurrentSort = sort;

            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryID == categoryId.Value);
            }
            ViewBag.CurrentCategoryId = categoryId;

            var messages = await query.ToListAsync();

            return View(messages);
        }

        [HttpPost]
        public async Task<IActionResult> ToggleImportant(int id)
        {
            var message = await _context.UserMessages.FindAsync(id);

            if (message == null)
            {
                return NotFound();
            }

            message.IsImportant = !message.IsImportant;

            await _context.SaveChangesAsync();

            return Json(new
            {
                isImportant = message.IsImportant
            });
        }

        public async Task<IActionResult> ImportantMails(string filter = "all", string category = "", string sort = "new")
        {
            var user = await _userManager.GetUserAsync(User);

            var query = _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.IsImportant == true && ((x.ReceiverID == user.Id && x.IsDeletedReceiver == false) || (x.SenderID == user.Id && x.IsDeletedSender == false)))
                .AsQueryable();

            if (filter == "unread")
            {
                query = query.Where(x => x.IsRead == false);
            }
            else if (filter == "read")
            {
                query = query.Where(x => x.IsRead == true);
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(x => x.Category != null && x.Category.Name == category);
            }

            if (sort == "old")
            {
                query = query.OrderBy(x => x.SendDate);
            }
            else
            {
                query = query.OrderByDescending(x => x.SendDate);
            }

            ViewBag.CurrentFilter   = filter;
            ViewBag.CurrentCategory = category;
            ViewBag.CurrentSort     = sort;
            ViewBag.CurrentUserId   = user.Id;

            ViewBag.Categories = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            var messages = await query.ToListAsync();

            return View(messages);
        }

        [HttpGet]
        public IActionResult SendMail()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendMail(SendMailDTO sendMailDTO)
        {
            if (sendMailDTO == null)
            {
                return RedirectToAction("SentMails", "Message");
            }

            var sender = await _userManager.FindByNameAsync(User.Identity.Name);

            if (string.IsNullOrWhiteSpace(sendMailDTO.ReceiverMail) || string.IsNullOrWhiteSpace(sendMailDTO.Subject) || string.IsNullOrWhiteSpace(sendMailDTO.Body))
            {
                return RedirectToAction("SentMails", "Message");
            }

            var receiverMail = sendMailDTO.ReceiverMail.Trim();

            var receiver = await _userManager.FindByEmailAsync(receiverMail);

            var message = new UserMessage
            {
                SenderID     = sender.Id,
                ReceiverID   = receiver?.Id,
                ReceiverMail = receiverMail,
                Subject      = sendMailDTO.Subject,
                Body         = sendMailDTO.Body,
                SendDate     = DateTime.Now
            };

            if (sendMailDTO.DraftID.HasValue)
            {
                var draft = await _context.UserMessages .FirstOrDefaultAsync(x => x.ID == sendMailDTO.DraftID.Value && x.SenderID == sender.Id);

                if (draft != null)
                {
                    _context.UserMessages.Remove(draft);
                }
            }

            _context.UserMessages.Add(message);

            await _context.SaveChangesAsync();

            return RedirectToAction("SentMails", "Message");
        }

        public async Task<IActionResult> Drafts(string filter = "all", string sort = "new")
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var query = _context.UserMessages
                .Include(x => x.Receiver)
                .Where(x =>
                    x.SenderID == user.Id &&
                    x.IsDraft &&
                    x.IsDeletedSender == false);

            switch (filter)
            {
                case "withReceiver":
                    query = query.Where(x =>
                        x.ReceiverMail != null &&
                        x.ReceiverMail != "");
                    break;

                case "withoutReceiver":
                    query = query.Where(x =>
                        x.ReceiverMail == null ||
                        x.ReceiverMail == "");
                    break;

                case "withSubject":
                    query = query.Where(x =>
                        x.Subject != null &&
                        x.Subject != "");
                    break;

                case "withoutSubject":
                    query = query.Where(x =>
                        x.Subject == null ||
                        x.Subject == "");
                    break;
            }

            query = sort == "old"
                ? query.OrderBy(x => x.SendDate)
                : query.OrderByDescending(x => x.SendDate);

            ViewBag.Filter = filter;
            ViewBag.Sort = sort;

            return View(await query.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> SaveDraft(SendMailDTO sendMailDTO)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var draft = new UserMessage
            {
                SenderID     = user.Id,
                ReceiverMail = sendMailDTO.ReceiverMail,
                Subject      = sendMailDTO.Subject ?? "",
                Body         = sendMailDTO.Body ?? "",
                SendDate     = DateTime.Now,
                IsDraft      = true
            };

            if (!string.IsNullOrWhiteSpace(sendMailDTO.ReceiverMail))
            {
                var receiver = await _userManager.FindByEmailAsync(sendMailDTO.ReceiverMail);

                if (receiver != null)
                {
                    draft.ReceiverID = receiver.Id;
                }
            }

            _context.UserMessages.Add(draft);
            await _context.SaveChangesAsync();

            return Json(new
            {
                success = true,
                messageId = draft.ID
            });
        }

        public async Task<IActionResult> EditDraft(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var draft = await _context.UserMessages
                .FirstOrDefaultAsync(x =>
                    x.ID == id &&
                    x.SenderID == user.Id &&
                    x.IsDraft);

            if (draft == null)
            {
                return NotFound();
            }

            return Json(new
            {
                id           = draft.ID,
                receiverMail = draft.ReceiverMail ?? "",
                subject      = draft.Subject ?? "",
                body         = draft.Body ?? "",
                receiverId   = draft.ReceiverID
            });
        }

        [HttpGet]
        public async Task<IActionResult> MailDetail(int id)
        {
            var message = await _context.UserMessages
                .Include(x => x.Sender)
                .FirstOrDefaultAsync(x => x.ID == id);

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return View(message);
        }

        [HttpPost]
        public async Task<IActionResult> DeleteMail(int id, string? returnUrl)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var deleteMail = await _context.UserMessages.FirstOrDefaultAsync(x => (x.ID == id && x.SenderID == user.Id) || (x.ID == id && x.ReceiverID == user.Id));

            if (deleteMail == null)
            {
                return NotFound();
            }

            if (deleteMail.SenderID == user.Id)
            {
                deleteMail.IsDeletedSender = true;
            }

            if (deleteMail.ReceiverID == user.Id)
            {
                deleteMail.IsDeletedReceiver = true;
            }

            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return LocalRedirect(returnUrl);
            }

            return RedirectToAction("Inbox", "Message");
        }

        [HttpPost]
        public async Task<IActionResult> DeleteSelectedDrafts([FromBody] List<int> ids)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            if (ids == null || ids.Count == 0)
            {
                return Json(new { success = false });
            }

            var drafts = await _context.UserMessages
                .Where(x => ids.Contains(x.ID) && x.SenderID == user.Id && x.IsDraft && x.IsDeletedSender == false)
                .ToListAsync();

            foreach (var draft in drafts)
            {
                draft.IsDeletedSender = true;
            }

            await _context.SaveChangesAsync();

            return Json(new
            {
                success = true
            });
        }

        [HttpPost]
        public async Task<IActionResult> BulkDeleteImportant([FromBody] List<int> ids)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            if (ids == null || ids.Count == 0)
            {
                return BadRequest();
            }

            var messages = await _context.UserMessages
                .Where(x => ids.Contains(x.ID) && x.ReceiverID == user.Id)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsDeletedReceiver = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true
            });
        }

        public async Task<IActionResult> Trash()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            ViewBag.UserId = user.Id;

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => (x.SenderID == user.Id && x.IsDeletedSender && !x.IsTrashEmptiedSender) || (x.ReceiverID == user.Id && x.IsDeletedReceiver && !x.IsTrashEmptiedReceiver))
                .OrderByDescending(x => x.SendDate)
                .ToListAsync();

            return View(messages);
        }

        /* RESTORE TRASH */
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreTrash([FromBody] List<int>? ids)
        {
            return await ChangeTrash(ids, true, false);
        }

        /* REMOVE FROM TRASH */
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveFromTrash([FromBody] List<int>? ids)
        {
            return await ChangeTrash(ids, false, false);
        }

        /* EMPTY TRASH */
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EmptyTrash()
        {
            return await ChangeTrash(null, false, true);
        }

        /* CHANGE TRASH */
        private async Task<IActionResult> ChangeTrash(List<int>? ids, bool restore, bool emptyAll)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
                return Unauthorized();

            // Tekli ve toplu işlemlerde ID zorunlu.
            if (!emptyAll && (ids == null || ids.Count == 0))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "İşlem yapılacak mesaj seçilmedi."
                });
            }

            var query = _context.UserMessages
                .Where(x =>
                    (x.SenderID == user.Id &&
                     x.IsDeletedSender &&
                     !x.IsTrashEmptiedSender)
                    ||
                    (x.ReceiverID == user.Id &&
                     x.IsDeletedReceiver &&
                     !x.IsTrashEmptiedReceiver));

            // Yalnızca seçili mesajları getir.
            if (!emptyAll)
            {
                query = query.Where(x => ids!.Contains(x.ID));
            }

            var messages = await query.ToListAsync();

            foreach (var message in messages)
            {
                if (message.SenderID == user.Id)
                {
                    if (restore)
                    {
                        message.IsDeletedSender = false;
                    }
                    else
                    {
                        message.IsTrashEmptiedSender = true;
                    }
                }

                if (message.ReceiverID == user.Id)
                {
                    if (restore)
                    {
                        message.IsDeletedReceiver = false;
                    }
                    else
                    {
                        message.IsTrashEmptiedReceiver = true;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Json(new
            {
                success = true,
                count = messages.Count
            });
        }

        [HttpPost]
        public async Task<IActionResult> AssignCategoryBulk(List<int> messageIds, int? categoryId)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            if (categoryId.HasValue)
            {
                var categoryExists = await _context.Categories.AnyAsync(x => x.ID == categoryId.Value && x.UserID == user.Id);

                if (!categoryExists)
                {
                    return BadRequest();
                }
            }

            var messages = await _context.UserMessages
                .Where(x => messageIds.Contains(x.ID) && x.SenderID == user.Id)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.CategoryID = categoryId;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true
            });
        }

        [HttpPost]
        public async Task<IActionResult> ChangeMailCategory(int messageId, int categoryId, int currentCategoryId)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == messageId && x.ReceiverID == user.Id);

            if (message == null)
            {
                return NotFound();
            }

            var categoryExists = await _context.Categories.AnyAsync(x => x.ID == categoryId && x.UserID == user.Id);

            if (!categoryExists)
            {
                return BadRequest();
            }

            message.CategoryID = categoryId;

            await _context.SaveChangesAsync();

            return RedirectToAction("Mails", "Category", new { id = currentCategoryId });
        }

        [HttpPost]
        public async Task<IActionResult> RemoveMailCategory(int messageId, int currentCategoryId)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == messageId && x.ReceiverID == user.Id);

            if (message == null)
            {
                return NotFound();
            }

            message.CategoryID = null;

            await _context.SaveChangesAsync();

            return RedirectToAction("Mails", "Category", new { id = currentCategoryId });
        }
    }
}