using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityMail.Web.Migrations
{
    /// <inheritdoc />
    public partial class Add_UserMessage_MailConversationId_Add : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ConversationId",
                table: "UserMessages",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "UserMessages");
        }
    }
}
