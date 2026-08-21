using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutTopNavbarViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}