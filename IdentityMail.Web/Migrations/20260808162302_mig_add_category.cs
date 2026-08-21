using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityMail.Web.Migrations
{
    /// <inheritdoc />
    public partial class mig_add_category : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_Category_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_UserMessages_ParentMessageID",
                table: "UserMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Category",
                table: "Category");

            migrationBuilder.RenameTable(
                name: "Category",
                newName: "CategoriesCategory");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CategoriesCategory",
                table: "CategoriesCategory",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMessages_CategoriesCategory_CategoryID",
                table: "UserMessages",
                column: "CategoryID",
                principalTable: "CategoriesCategory",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMessages_UserMessages_ParentMessageID",
                table: "UserMessages",
                column: "ParentMessageID",
                principalTable: "UserMessages",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_CategoriesCategory_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_UserMessages_ParentMessageID",
                table: "UserMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CategoriesCategory",
                table: "CategoriesCategory");

            migrationBuilder.RenameTable(
                name: "CategoriesCategory",
                newName: "Category");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Category",
                table: "Category",
                column: "ID");

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
    }
}
