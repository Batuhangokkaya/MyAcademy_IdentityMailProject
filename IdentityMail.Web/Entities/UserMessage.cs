using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityMail.Web.Entities
{
    public class UserMessage
    {
        public int ID { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public DateTime SendDate { get; set; }
        public bool IsRead { get; set; }
        public bool IsImportant { get; set; }
        public bool IsDeletedSender { get; set; }
        public bool IsDeletedReceiver { get; set; }
        public bool IsDraft { get; set; }
        // Sender
        public int SenderID { get; set; }
        public AppUser Sender { get; set; }
        // Sender
        public int ReceiverID { get; set; }
        public AppUser Receiver { get; set; }
        // Category
        public int? CategoryID { get; set; }
        public Category Category { get; set; }
        // Parent Message
        public int? ParentMessageID { get; set; }
        public UserMessage ParentMessage { get; set; }
    }
}