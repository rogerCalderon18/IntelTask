namespace IntelTask.Domain.Configuration
{
    public class EmailSettings
    {
        public required string CT_Smtp_server { get; set; }
        public required int CN_Smtp_port { get; set; }
        public required string CT_Sender_email { get; set; }
        public required string CT_Sender_password { get; set; }
        public required string CT_Sender_name { get; set; }
    }
}