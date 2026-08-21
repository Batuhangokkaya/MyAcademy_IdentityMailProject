using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityMail.Web.Migrations
{
    /// <inheritdoc />
    public partial class mig_rename_Category : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_CategoriesCategory_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CategoriesCategory",
                table: "CategoriesCategory");

            migrationBuilder.RenameTable(
                name: "CategoriesCategory",
                newName: "Categories");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMessages_Categories_CategoryID",
                table: "UserMessages",
                column: "CategoryID",
                principalTable: "Categories",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMessages_Categories_CategoryID",
                table: "UserMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.RenameTable(
                name: "Categories",
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
        }
    }
}
