using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.Layout
{
    public class _LayoutScriptViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}