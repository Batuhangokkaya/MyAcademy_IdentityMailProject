using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutHeadViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}