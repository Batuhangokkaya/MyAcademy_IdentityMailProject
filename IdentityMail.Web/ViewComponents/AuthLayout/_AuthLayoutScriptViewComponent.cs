using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.AuthLayout
{
    public class _AuthLayoutScriptViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}