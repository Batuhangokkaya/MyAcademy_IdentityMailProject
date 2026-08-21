using IdentityMail.Web.DTOs.UserMessageDTOs;
using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutComposeMessageViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            var sendMailDTO = new SendMailDTO();
            return View(sendMailDTO);
        }
    }
}