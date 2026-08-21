using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityMail.Web.Migrations
{
    /// <inheritdoc />
    public partial class mig_update_usermessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryID",
                table: "UserMessages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeletedReceiver",
                table: "UserMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeletedSender",
                table: "UserMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "UserMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ParentMessageID",
                table: "UserMessages",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.ID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserMessages_CategoryID",
                table: "UserMessages",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_UserMessages_ParentMessageID",
                table: "UserMessages",
                column: "ParentMessageID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMessages_Category_CategoryID",
                table: "UserMessages",
                column: "CategoryID",
                principalTable: "Category",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMessages_UserMessages_ParentMessageID",
                table: "UserMessages",
                column: "ParentMessageID",
                principalTable: "UserMessages",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_Category_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_UserMessages_ParentMessageID",
                table: "UserMessages");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropIndex(
                name: "IX_UserMessages_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropIndex(
                name: "IX_UserMessages_ParentMessageID",
                table: "UserMessages");

            migrationBuilder.DropColumn(
                name: "CategoryID",
                table: "UserMessages");

            migrationBuilder.DropColumn(
                name: "IsDeletedReceiver",
                table: "UserMessages");

            migrationBuilder.DropColumn(
                name: "IsDeletedSender",
                table: "UserMessages");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "UserMessages");

            migrationBuilder.DropColumn(
                name: "ParentMessageID",
                table: "UserMessages");
        }
    }
}
