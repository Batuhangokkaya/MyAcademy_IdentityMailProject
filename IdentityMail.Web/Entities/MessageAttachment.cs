namespace IdentityMail.Web.Entities
{
    public class MessageAttachment
    {
        public int ID { get; set; }
        public int UserMessageID { get; set; }
        public UserMessage UserMessage { get; set; }
        public string OriginalFileName { get; set; }
        public string StoredFileName { get; set; }
        public string ContentType { get; set; }
        public long Size { get; set; }
    }
}