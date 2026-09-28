using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IdentityMail.Web.Migrations
{
    /// <inheritdoc />
    public partial class mig_MessageReports_Ad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MessageReports",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageID = table.Column<int>(type: "int", nullable: false),
                    ReporterUserID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageReports", x => x.ID);
                    table.ForeignKey(
                        name: "FK_MessageReports_AspNetUsers_ReporterUserID",
                        column: x => x.ReporterUserID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MessageReports_UserMessages_MessageID",
                        column: x => x.MessageID,
                        principalTable: "UserMessages",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MessageReports_MessageID",
                table: "MessageReports",
                column: "MessageID");

            migrationBuilder.CreateIndex(
                name: "IX_MessageReports_ReporterUserID",
                table: "MessageReports",
                column: "ReporterUserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageReports");
        }
    }
}
