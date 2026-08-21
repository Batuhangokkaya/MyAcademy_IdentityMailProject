namespace IdentityMail.Web.DTOs.UserMessageDTOs
{
    public class SendMailDTO
    {
        public int? DraftID { get; set; }
        public string ReceiverMail { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
}