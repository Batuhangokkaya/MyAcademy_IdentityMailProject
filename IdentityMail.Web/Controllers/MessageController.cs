using IdentityMail.Web.Context;
using IdentityMail.Web.DTOs.UserMessageDTOs;
using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager,User")]
    public class MessageController(UserManager<AppUser> _userManager,
                                   AppDbContext _context, 
                                   IWebHostEnvironment _webHostEnvironment) : Controller
    {
        public async Task<IActionResult> Inbox(string filter = "all", string sort = "new", int? categoryID = null, int page = 1)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Challenge();
            }

            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

            var messages = _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Category)
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
            else if (filter == "important")
            {
                messages = messages.Where(x => x.IsImportant == true);
            }

            ViewBag.CurrentFilter = filter;

            if (categoryID.HasValue)
            {
                messages = messages.Where(x => x.CategoryID == categoryID.Value);
            }

            ViewBag.CurrentCategoryId = categoryID;

            if (sort == "old")
            {
                messages = messages.OrderBy(x => x.SendDate);
            }
            else
            {
                messages = messages.OrderByDescending(x => x.SendDate);
            }

            ViewBag.CurrentSort = sort;

            var totalMessages = await messages.CountAsync();
            var totalPages    = (int)Math.Ceiling(totalMessages / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var query = await messages
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage    = page;
            ViewBag.TotalPages     = totalPages;
            ViewBag.UnreadMessages = await _context.UserMessages
                .Where(x => x.ReceiverID == user.Id && x.IsRead == false && x.IsDeletedReceiver == false)
                .CountAsync();

            return View(query);
        }

        public async Task<IActionResult> SentMails(int? categoryId = null, string sort = "new", string filter = "all", int page = 1)
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

            var query = _context.UserMessages
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.SenderID == user.Id && x.IsDeletedSender == false)
                .AsQueryable();

            ViewBag.CurrentCategoryId = categoryId;
            ViewBag.CurrentSort       = sort;
            ViewBag.CurrentFilter     = filter;
            ViewBag.Categories        = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            if (filter == "important")
            {
                query = query.Where(x => x.IsImportant == true);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryID == categoryId.Value);
            }

            if (sort == "old")
            {
                query = query.OrderBy(x => x.SendDate);
            }
            else
            {
                query = query.OrderByDescending(x => x.SendDate);
            }

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

            ViewBag.CurrentPage   = page;
            ViewBag.TotalPages    = totalPages;
            ViewBag.TotalMessages = totalMessages;

            return View(messages);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ToggleImportant(int id, bool fromDetail = false)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == id && (x.SenderID == user.Id || x.ReceiverID == user.Id));

            if (message == null)
            {
                return NotFound();
            }

            message.IsImportant = !message.IsImportant;

            await _context.SaveChangesAsync();

            if (fromDetail)
            {
                return RedirectToAction("MailDetail", new { id });
            }

            return Json(new
            {
                isImportant = message.IsImportant
            });
        }

        public async Task<IActionResult> ImportantMails(string filter = "all", string category = "", string sort = "new", int page = 1)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            const int pageSize = 20;

            if (page < 1)
            {
                page = 1;
            }

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

            ViewBag.CurrentFilter   = filter;
            ViewBag.CurrentCategory = category;
            ViewBag.CurrentSort     = sort;
            ViewBag.CurrentUserId   = user.Id;
            ViewBag.CurrentPage     = page;
            ViewBag.TotalPages      = totalPages;
            ViewBag.TotalMessages   = totalMessages;
            ViewBag.Categories      = await _context.Categories
                .Where(x => x.UserID == user.Id)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return View(messages);
        }

        [HttpGet]
        public IActionResult SendMail()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [RequestSizeLimit(30_000_000)]
        public async Task<IActionResult> SendMail(SendMailDTO sendMailDTO)
        {
            var sender = await _userManager.GetUserAsync(User);

            if (sender == null)
            {
                return Challenge();
            }

            if (sendMailDTO == null || string.IsNullOrWhiteSpace(sendMailDTO.ReceiverMail) || string.IsNullOrWhiteSpace(sendMailDTO.Subject) || string.IsNullOrWhiteSpace(sendMailDTO.Body))
            {
                TempData["ComposeError"] = "Lütfen gerekli alanları doldurun.";

                if (!string.IsNullOrWhiteSpace(sendMailDTO.ReturnUrl) && Url.IsLocalUrl(sendMailDTO.ReturnUrl))
                {
                    return LocalRedirect(sendMailDTO.ReturnUrl);
                }

                return RedirectToAction("SentMails");
            }

            if (sendMailDTO.ReplyToMessageID.HasValue && sendMailDTO.ForwardFromMessageID.HasValue)
            {
                return BadRequest();
            }

            var receiverMail = sendMailDTO.ReceiverMail.Trim();
            var receiver     = await _userManager.FindByEmailAsync(receiverMail);

            if (receiver == null)
            {
                TempData["ComposeError"] = "Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.";

                if (!string.IsNullOrWhiteSpace(sendMailDTO.ReturnUrl) && Url.IsLocalUrl(sendMailDTO.ReturnUrl))
                {
                    return LocalRedirect(sendMailDTO.ReturnUrl);
                }

                return RedirectToAction("SentMails");
            }

            UserMessage originalReply   = null;
            UserMessage originalForward = null;

            if (sendMailDTO.ReplyToMessageID.HasValue)
            {
                originalReply = await _context.UserMessages
                    .Include(x => x.Sender)
                    .Include(x => x.Receiver)
                    .Include(x => x.Attachments)
                    .FirstOrDefaultAsync(x => x.ID == sendMailDTO.ReplyToMessageID.Value && (x.SenderID == sender.Id || x.ReceiverID == sender.Id));

                if (originalReply == null)
                {
                    return NotFound();
                }

                var expectedReceiver = originalReply.SenderID == sender.Id ? originalReply.Receiver?.Email ?? originalReply.ReceiverMail : originalReply.Sender?.Email;

                if (!string.Equals(expectedReceiver?.Trim(), receiverMail, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Yanıtın alıcısı değiştirilemez.");
                }
            }

            if (sendMailDTO.ForwardFromMessageID.HasValue)
            {
                originalForward = await _context.UserMessages
                    .Include(x => x.Sender)
                    .Include(x => x.Receiver)
                    .Include(x => x.Attachments)
                    .FirstOrDefaultAsync(x => x.ID == sendMailDTO.ForwardFromMessageID.Value && (x.SenderID == sender.Id || x.ReceiverID == sender.Id));

                if (originalForward == null)
                {
                    return NotFound();
                }
            }

            var uploads              = sendMailDTO.Attachments ?? new List<IFormFile>();
            var forwardedAttachments = (originalForward ?? originalReply)?.Attachments.ToList() ?? new List<MessageAttachment>();

            var allowedTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                [".jpg"]  = "image/jpeg",
                [".jpeg"] = "image/jpeg",
                [".png"]  = "image/png",
                [".webp"] = "image/webp",
                [".pdf"]  = "application/pdf",
                [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                [".txt"]  = "text/plain"
            };

            var totalCount = uploads.Count + forwardedAttachments.Count;
            var totalSize  = uploads.Sum(f => f.Length) + forwardedAttachments.Sum(f => f.Size);

            if (totalCount > 5 || totalSize > 25L * 1024 * 1024)
            {
                TempData["ComposeError"] = "En fazla 5 dosya ve toplam 25 MB ekleyebilirsiniz.";

                if (!string.IsNullOrWhiteSpace(sendMailDTO.ReturnUrl) && Url.IsLocalUrl(sendMailDTO.ReturnUrl))
                {
                    return LocalRedirect(sendMailDTO.ReturnUrl);
                }

                return RedirectToAction("SentMails");
            }

            foreach (var file in uploads)
            {
                var extension = Path.GetExtension(file.FileName);

                if (file.Length == 0 || file.Length > 10L * 1024 * 1024 || !allowedTypes.ContainsKey(extension))
                {
                    TempData["ComposeError"] = "Geçersiz dosya türü veya boyutu.";

                    if (!string.IsNullOrWhiteSpace(sendMailDTO.ReturnUrl) && Url.IsLocalUrl(sendMailDTO.ReturnUrl))
                    {
                        return LocalRedirect(sendMailDTO.ReturnUrl);
                    }

                    return RedirectToAction("SentMails");
                }
            }

            foreach (var attachment in forwardedAttachments)
            {
                var extension = Path.GetExtension(attachment.StoredFileName);

                if (attachment.Size > 10L * 1024 * 1024 || !allowedTypes.ContainsKey(extension))
                {
                    TempData["ComposeError"] = "İletilen dosyalardan biri desteklenmiyor.";
                    return RedirectToAction("SentMails");
                }
            }

            int? conversationId = null;

            if (originalReply != null)
            {
                conversationId = originalReply.ConversationId ?? originalReply.ID;

                if (!originalReply.ConversationId.HasValue)
                {
                    originalReply.ConversationId = conversationId;
                }
            }

            var message = new UserMessage
            {
                SenderID       = sender.Id,
                ReceiverID     = receiver.Id,
                ReceiverMail   = receiverMail,
                Subject        = sendMailDTO.Subject,
                Body           = sendMailDTO.Body,
                SendDate       = DateTime.Now,
                ConversationId = conversationId,
                Attachments    = new List<MessageAttachment>()
            };

            var uploadDirectory = Path.Combine(_webHostEnvironment.ContentRootPath, "PrivateUploads", "Mail");

            Directory.CreateDirectory(uploadDirectory);

            var savedPaths = new List<string>();

            try
            {
                foreach (var file in uploads)
                {
                    var extension   = Path.GetExtension(file.FileName).ToLowerInvariant();
                    var storedName  = Guid.NewGuid().ToString("N") + extension;
                    var destination = Path.Combine(uploadDirectory, storedName);

                    savedPaths.Add(destination);

                    await using (var stream = new FileStream(destination, FileMode.CreateNew))
                    {
                        await file.CopyToAsync(stream);
                    }

                    message.Attachments.Add(new MessageAttachment
                    {
                        OriginalFileName = Path.GetFileName(file.FileName.Replace('\\', '/')),
                        StoredFileName   = storedName,
                        ContentType      = allowedTypes[extension],
                        Size             = file.Length
                    });
                }

                foreach (var attachment in forwardedAttachments)
                {
                    var sourceName = attachment.StoredFileName;

                    if (string.IsNullOrWhiteSpace(sourceName) || Path.GetFileName(sourceName) != sourceName || sourceName.Contains('/') || sourceName.Contains('\\'))
                    {
                        throw new IOException("Geçersiz dosya yolu.");
                    }

                    var source        = Path.Combine(uploadDirectory, sourceName);
                    var extension     = Path.GetExtension(sourceName).ToLowerInvariant();
                    var newStoredName = Guid.NewGuid().ToString("N") + extension;
                    var destination   = Path.Combine(uploadDirectory, newStoredName);

                    savedPaths.Add(destination);

                    await using (var input = new FileStream(source, FileMode.Open, FileAccess.Read))
                    await using (var output = new FileStream(destination, FileMode.CreateNew))
                    {
                        await input.CopyToAsync(output);
                    }

                    message.Attachments.Add(new MessageAttachment
                    {
                        OriginalFileName = attachment.OriginalFileName,
                        StoredFileName   = newStoredName,
                        ContentType      = allowedTypes[extension],
                        Size             = attachment.Size
                    });
                }

                if (sendMailDTO.DraftID.HasValue)
                {
                    var draft = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == sendMailDTO.DraftID.Value && x.SenderID == sender.Id);

                    if (draft != null)
                    {
                        _context.UserMessages.Remove(draft);
                    }
                }

                _context.UserMessages.Add(message);
                await _context.SaveChangesAsync();
               
                if (!conversationId.HasValue)
                {
                    message.ConversationId = message.ID;
                    await _context.SaveChangesAsync();
                }

                var notification = new Notification
                {
                    UserID      = receiver.Id,
                    MessageID   = message.ID,
                    Title       = "Yeni Mesaj",
                    Description = $"{sender.FirstName} {sender.LastName} size yeni bir mesaj gönderdi.",
                    IsRead      = false,
                    CreatedAt   = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch
            {
                foreach (var path in savedPaths)
                {
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }

                throw;
            }

            return RedirectToAction("SentMails", "Message");
        }

        public async Task<IActionResult> Drafts(string filter = "all", string sort = "new", int page = 1)
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

            var query = _context.UserMessages
                .Include(x => x.Receiver)
                .Where(x => x.SenderID == user.Id && x.IsDraft && x.IsDeletedSender == false);

            switch (filter)
            {
                case "withReceiver":
                    query = query.Where(x => x.ReceiverMail != null && x.ReceiverMail != "");
                    break;
                case "withoutReceiver":
                    query = query.Where(x => x.ReceiverMail == null || x.ReceiverMail == "");
                    break;
                case "withSubject":
                    query = query.Where(x => x.Subject != null && x.Subject != "");
                    break;
                case "withoutSubject":
                    query = query.Where(x => x.Subject == null || x.Subject == "");
                    break;
            }

            query = sort == "old" ? query.OrderBy(x => x.SendDate) : query.OrderByDescending(x => x.SendDate);

            var totalDrafts = await query.CountAsync();
            var totalPages  = (int)Math.Ceiling(totalDrafts / (double)pageSize);

            if (totalPages > 0 && page > totalPages)
            {
                page = totalPages;
            }

            var messages = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.Filter      = filter;
            ViewBag.Sort        = sort;
            ViewBag.CurrentPage = page;
            ViewBag.TotalPages  = totalPages;
            ViewBag.TotalDrafts = totalDrafts;

            return View(messages);
        }

        [HttpPost]
        public async Task<IActionResult> SaveDraft(SendMailDTO sendMailDTO)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            UserMessage draft;

            if (sendMailDTO.DraftID.HasValue)
            {
                draft = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == sendMailDTO.DraftID.Value && x.SenderID == user.Id && x.IsDraft && x.IsDeletedSender == false);

                if (draft == null)
                {
                    return NotFound();
                }

                draft.ReceiverMail = sendMailDTO.ReceiverMail;
                draft.Subject      = sendMailDTO.Subject ?? "";
                draft.Body         = sendMailDTO.Body ?? "";
                draft.SendDate     = DateTime.Now;

                draft.ReceiverID = null;

                if (!string.IsNullOrWhiteSpace(sendMailDTO.ReceiverMail))
                {
                    var receiver = await _userManager.FindByEmailAsync(sendMailDTO.ReceiverMail);

                    if (receiver != null)
                    {
                        draft.ReceiverID = receiver.Id;
                    }
                }
            }
            else
            {
                draft = new UserMessage
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
            }

            await _context.SaveChangesAsync();

            return Json(new
            {
                success   = true,
                messageId = draft.ID
            });
        }

        public async Task<IActionResult> EditDraft(int id)
        {
            var user  = await _userManager.FindByNameAsync(User.Identity.Name);
            var draft = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == id && x.SenderID == user.Id && x.IsDraft);

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
        public async Task<IActionResult> MailDetail(int id, string? returnUrl = null, string? returnText = null)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var message = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Include(x => x.Attachments)
                .FirstOrDefaultAsync(x => x.ID == id && (x.SenderID == user.Id || x.ReceiverID == user.Id));

            if (message == null)
            {
                return NotFound();
            }

            if (message.ReceiverID == user.Id)
            {
                if (!message.IsRead)
                {
                    message.IsRead = true;
                }

                var notifications = await _context.Notifications
                    .Where(n => n.MessageID == message.ID && n.UserID == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }

            ViewBag.CanMarkUnread = message.ReceiverID != null && message.ReceiverID == user.Id;
            ViewBag.ReplyMail     = message.SenderID == user.Id ? (message.Receiver?.Email ?? message.ReceiverMail ?? "") : (message.Sender?.Email ?? "");
            ViewBag.ReturnUrl     = returnUrl;
            ViewBag.ReturnText    = returnText;

            return View(message);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ReportMessage(int id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == id && (x.SenderID == user.Id || x.ReceiverID == user.Id));

            if (message == null)
            {
                return NotFound();
            }

            var alreadyReported = await _context.MessageReports.AnyAsync(x => x.MessageID == message.ID && x.ReporterUserID == user.Id);

            if (!alreadyReported)
            {
                var report = new MessageReport
                {
                    MessageID      = message.ID,
                    ReporterUserID = user.Id,
                    CreatedAt      = DateTime.UtcNow
                };

                await _context.MessageReports.AddAsync(report);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("MailDetail", new { id = message.ID });
        }

        [HttpGet]
        public async Task<IActionResult> AttachmentFile(int id, bool download = false)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var attachment = await _context.MessageAttachments
                .Include(x => x.UserMessage)
                .FirstOrDefaultAsync(x => x.ID == id && (x.UserMessage.SenderID == user.Id || x.UserMessage.ReceiverID == user.Id));

            if (attachment == null)
            {
                return NotFound();
            }

            var storedName = attachment.StoredFileName;

            if (string.IsNullOrWhiteSpace(storedName) || storedName.Contains('/') || storedName.Contains('\\') || storedName is "." or "..")
            {
                return NotFound();
            }

            var path = Path.Combine(_webHostEnvironment.ContentRootPath, "PrivateUploads", "Mail", storedName);

            if (!System.IO.File.Exists(path))
            {
                return NotFound();
            }

            var extension = Path.GetExtension(storedName).ToLowerInvariant();

            var contentType = extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png"            => "image/png",
                ".webp"           => "image/webp",
                ".pdf"            => "application/pdf",
                ".txt"            => "text/plain",
                ".docx"           => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _                 => "application/octet-stream"
            };

            Response.Headers["X-Content-Type-Options"] = "nosniff";

            var isImage = extension is ".jpg" or ".jpeg" or ".png" or ".webp";

            if (download || !isImage)
            {
                return PhysicalFile(path, contentType, attachment.OriginalFileName);
            }

            return PhysicalFile(path, contentType);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkAsUnread(int id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Challenge();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == id && x.ReceiverID == user.Id);

            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = false;

            await _context.SaveChangesAsync();

            return RedirectToAction("Inbox");
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
        public async Task<IActionResult> DeleteSelectedDrafts([FromBody] List<int> id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            if (id == null || id.Count == 0)
            {
                return Json(new { success = false });
            }

            var drafts = await _context.UserMessages
                .Where(x => id.Contains(x.ID) && x.SenderID == user.Id && x.IsDraft && x.IsDeletedSender == false)
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
        public async Task<IActionResult> BulkDeleteImportant([FromBody] List<int> id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            if (id == null || id.Count == 0)
            {
                return BadRequest();
            }

            var messages = await _context.UserMessages
                .Where(x => id.Contains(x.ID) && x.ReceiverID == user.Id)
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

        public async Task<IActionResult> Trash(string filter = "all", int page = 1)
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

            ViewBag.UserId        = user.Id;
            ViewBag.CurrentFilter = filter;

            var query = _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => (x.SenderID == user.Id && x.IsDeletedSender && !x.IsTrashEmptiedSender) || (x.ReceiverID == user.Id && x.IsDeletedReceiver && !x.IsTrashEmptiedReceiver))
                .AsQueryable();

            if (filter == "received")
            {
                query = query.Where(x => x.ReceiverID == user.Id);
            }
            else if (filter == "sent")
            {
                query = query.Where(x => x.SenderID == user.Id);
            }
            else if (filter == "important")
            {
                query = query.Where(x => x.IsImportant == true);
            }

            query = query.OrderByDescending(x => x.SendDate);

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

            ViewBag.CurrentPage   = page;
            ViewBag.TotalPages    = totalPages;
            ViewBag.TotalMessages = totalMessages;

            return View(messages);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreTrash([FromBody] List<int>? id)
        {
            return await ChangeTrash(id, true, false);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RemoveFromTrash([FromBody] List<int>? id)
        {
            return await ChangeTrash(id, false, false);
        }
       
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EmptyTrash()
        {
            return await ChangeTrash(null, false, true);
        }

        private async Task<IActionResult> ChangeTrash(List<int>? id, bool restore, bool emptyAll)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            if (!emptyAll && (id == null || id.Count == 0))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "İşlem yapılacak mesaj seçilmedi."
                });
            }

            var query = _context.UserMessages.Where(x => (x.SenderID == user.Id && x.IsDeletedSender && !x.IsTrashEmptiedSender) || (x.ReceiverID == user.Id && x.IsDeletedReceiver && !x.IsTrashEmptiedReceiver));

            if (!emptyAll)
            {
                query = query.Where(x => id!.Contains(x.ID));
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

            if (messageIds == null || messageIds.Count == 0)
            {
                return BadRequest();
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
                .Where(x => messageIds.Contains(x.ID) && (x.SenderID == user.Id || x.ReceiverID == user.Id))
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
        public async Task<IActionResult> ChangeMailCategory(int messageID, int categoryID, int currentCategoryID)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == messageID && x.ReceiverID == user.Id);

            if (message == null)
            {
                return NotFound();
            }

            var categoryExists = await _context.Categories.AnyAsync(x => x.ID == categoryID && x.UserID == user.Id);

            if (!categoryExists)
            {
                return BadRequest();
            }

            message.CategoryID = categoryID;

            await _context.SaveChangesAsync();

            return RedirectToAction("Mails", "Category", new { id = currentCategoryID });
        }

        [HttpPost]
        public async Task<IActionResult> RemoveMailCategory(int messageID, int currentCategoryID)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                return Unauthorized();
            }

            var message = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == messageID && x.ReceiverID == user.Id);

            if (message == null)
            {
                return NotFound();
            }

            message.CategoryID = null;

            await _context.SaveChangesAsync();

            return RedirectToAction("Mails", "Category", new { id = currentCategoryID });
        }

        [HttpGet]
        public async Task<IActionResult> Search(string? query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Json(Array.Empty<object>());
            }

            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return Unauthorized();
            }

            query = query.Trim();

            var messages = await _context.UserMessages
                .AsNoTracking()
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Where(x => (x.SenderID == user.Id && !x.IsDeletedSender) || (x.ReceiverID == user.Id && !x.IsDeletedReceiver))
                .Where(x => (x.Subject != null && x.Subject.Contains(query)) || (x.Body != null && x.Body.Contains(query)) || (x.Sender != null && ((x.Sender.FirstName != null && x.Sender.FirstName.Contains(query)) || (x.Sender.LastName != null && x.Sender.LastName.Contains(query)) || (x.Sender.Email != null && x.Sender.Email.Contains(query)))) || (x.Receiver != null && ((x.Receiver.FirstName != null && x.Receiver.FirstName.Contains(query)) || (x.Receiver.LastName != null && x.Receiver.LastName.Contains(query)) || (x.Receiver.Email != null && x.Receiver.Email.Contains(query)))))
                .OrderByDescending(x => x.ID)
                .Take(10)
                .Select(x => new
                {
                    id      = x.ID,
                    isSent  = x.SenderID == user.Id,
                    name    = x.SenderID == user.Id ? (x.Receiver != null ? x.Receiver.FirstName + " " + x.Receiver.LastName : "Alıcı bulunamadı") : (x.Sender != null ? x.Sender.FirstName + " " + x.Sender.LastName : "Gönderen bulunamadı"),
                    subject = x.Subject,
                    body    = x.Body
                })
                .ToListAsync();

            return Json(messages);
        }
    }
}