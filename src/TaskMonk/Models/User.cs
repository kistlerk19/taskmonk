using System.Text.Json.Serialization;

namespace TaskMonk.Models
{
    public class User
    {
        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
        
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;
        
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;
        
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;
        
        [JsonPropertyName("teams")]
        public List<string> Teams { get; set; } = new List<string>();
        
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}