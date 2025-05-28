using System.Text.Json.Serialization;

namespace TaskMonk.Models
{
    public class Team
    {
        [JsonPropertyName("teamId")]
        public string TeamId { get; set; } = string.Empty;
        
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        
        [JsonPropertyName("ownerId")]
        public string OwnerId { get; set; } = string.Empty;
        
        [JsonPropertyName("members")]
        public List<string> Members { get; set; } = new List<string>();
        
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}