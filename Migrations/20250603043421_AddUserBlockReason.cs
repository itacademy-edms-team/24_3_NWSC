using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NWSC.Migrations
{
    /// <inheritdoc />
    public partial class AddUserBlockReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlockReason",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlockReason",
                table: "AspNetUsers");
        }
    }
}
