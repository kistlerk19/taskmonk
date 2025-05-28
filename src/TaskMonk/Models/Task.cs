using System.Text.Json.Serialization;

namespace TaskMonk.Models
{
    public class Task
    {
        [JsonPropertyName("taskId")]
        public string TaskId { get; set; } = string.Empty;
        
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        
        [JsonPropertyName("status")]
        public TaskStatus Status { get; set; } = TaskStatus.Todo;
        
        [JsonPropertyName("priority")]
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        [JsonPropertyName("assignedTo")]
        public string? AssignedTo { get; set; }
        
        [JsonPropertyName("teamId")]
        public string TeamId { get; set; } = string.Empty;
        
        [JsonPropertyName("createdBy")]
        public string CreatedBy { get; set; } = string.Empty;
        
        [JsonPropertyName("deadline")]
        public DateTime? Deadline { get; set; }
        
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public enum TaskStatus
    {
        Todo,
        InProgress,
        Review,
        Done
    }
    
    public enum TaskPriority
    {
        Low,
        Medium,
        High,
        Critical
    }
}