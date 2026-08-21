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
        public async Task<IActionResult> Inbox()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Category)
                .Where(x => x.ReceiverID == user.Id && x.IsDeletedReceiver == false)
                .ToListAsync();

            var unreadMessages = await _context.UserMessages
                .Include(x => x.Sender)
                .Where(x => x.ReceiverID == user.Id && x.IsRead == false)
                .CountAsync();
            ViewBag.UnreadMessages = unreadMessages;

            return View(messages);
        }

        public async Task<IActionResult> SentMails()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var messages = await _context.UserMessages
                .Include(x => x.Receiver)
                .Include(x => x.Category)
                .Where(x => x.SenderID == user.Id && x.IsDeletedSender == false)
                .ToListAsync();

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

        public async Task<IActionResult> ImportantMessages()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Category)
                .Where(x => x.ReceiverID == user.Id && x.IsImportant == true)
                .ToListAsync();

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
            var sender   = await _userManager.FindByNameAsync(User.Identity.Name);
            var receiver = await _userManager.FindByEmailAsync(sendMailDTO.ReceiverMail);

            if (receiver is null)
            {
                ModelState.AddModelError(string.Empty, "Girdiğiniz Mail ile sistemde kayıtlı kullanıcı bulunamadı.");
                return View(sendMailDTO);
            }

            var newMessage = new UserMessage
            {
                SendDate   = DateTime.Now,
                ReceiverID = receiver.Id,
                SenderID   = sender.Id,
                Subject    = sendMailDTO.Subject,
                Body       = sendMailDTO.Body
            };

            if (sendMailDTO.DraftID.HasValue)
            {
                var draft = await _context.UserMessages.FirstOrDefaultAsync(x => x.ID == sendMailDTO.DraftID.Value);

                if (draft != null)
                {
                    _context.UserMessages.Remove(draft);
                }
            }

            _context.UserMessages.Add(newMessage);
            await _context.SaveChangesAsync();

            return RedirectToAction("Inbox", "Message");
        }

        public async Task<IActionResult> Drafts()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var drafts = await _context.UserMessages
                .Include(x => x.Receiver)
                .Where(x => x.SenderID == user.Id && x.IsDraft)
                .OrderByDescending(x => x.SendDate)
                .ToListAsync();

            return View(drafts);
        }

        [HttpPost]
        public async Task<IActionResult> SaveDraft(SendMailDTO sendMailDTO)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Girdiğiniz Mail ile sistemde kayıtlı kullanıcı bulunamadı.");
                return View(sendMailDTO);
            }

            var draft = new UserMessage
            {
                SenderID   = user.Id,
                Subject    = sendMailDTO.Subject,
                Body       = sendMailDTO.Body,
                SendDate   = DateTime.Now,
                IsDraft    = true
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
                success   = true,
                messageId = draft.ID
            });
        }

        public async Task<IActionResult> EditDraft(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var draft = await _context.UserMessages
                .Include(x => x.Receiver)
                .FirstOrDefaultAsync(x => x.ID == id && x.SenderID == user.Id && x.IsDraft);

            if (draft == null)
            {
                return NotFound();
            }

            return Json(new
            {
                id           = draft.ID,
                receiverMail = draft.Receiver.Email != null ? draft.Receiver.Email : "",
                subject      = draft.Subject,
                body         = draft.Body,
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
        public async Task<IActionResult> DeleteMail(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var deleteMail = await _context.UserMessages.FirstOrDefaultAsync(x => (x.ID == id && x.SenderID == user.Id) || (x.ID == id && x.ReceiverID == user.Id));

            if (deleteMail.SenderID == user.Id)
            {
                deleteMail.IsDeletedSender = true;
            }

            if (deleteMail.ReceiverID == user.Id)
            {
                deleteMail.IsDeletedReceiver = true;
            }

            await _context.SaveChangesAsync();
            return RedirectToAction("Trash", "Message");
        }

        public async Task<IActionResult> Trash()
        {
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            var messages = await _context.UserMessages
                .Include(x => x.Sender)
                .Include(x => x.Receiver)
                .Where(x => (x.SenderID == user.Id && x.IsDeletedSender) || (x.ReceiverID == user.Id && x.IsDeletedReceiver))
                .ToListAsync();

            ViewBag.UserID = user.Id;
            return View(messages);
        }
    }
}