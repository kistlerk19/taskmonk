using System.Text.Json.Serialization;

namespace TaskMonk.Models
{
    public class Comment
    {
        [JsonPropertyName("commentId")]
        public string CommentId { get; set; } = string.Empty;
        
        [JsonPropertyName("taskId")]
        public string TaskId { get; set; } = string.Empty;
        
        [JsonPropertyName("userId")]
        public string UserId { get; set; } = string.Empty;
        
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
        
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}