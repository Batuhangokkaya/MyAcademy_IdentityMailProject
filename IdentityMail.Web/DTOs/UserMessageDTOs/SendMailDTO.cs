namespace IdentityMail.Web.DTOs.UserMessageDTOs
{
    public class SendMailDTO
    {
        public int? DraftID { get; set; }
        public string? ReceiverMail { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public List<IFormFile> Attachments { get; set; }
        public int? ReplyToMessageID { get; set; }
        public int? ForwardFromMessageID { get; set; }
        public string? ReturnUrl { get; set; }
    }
}