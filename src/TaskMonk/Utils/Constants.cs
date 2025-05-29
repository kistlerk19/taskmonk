using System;

namespace TaskMonk.Utils
{
    public static class Constants
    {
        // DynamoDB Table Names - Read from environment variables with fallback
        public static string UsersTable => Environment.GetEnvironmentVariable("USERS_TABLE") ?? "TaskMonk-Users";
        public static string TeamsTable => Environment.GetEnvironmentVariable("TEAMS_TABLE") ?? "TaskMonk-Teams";
        public static string TasksTable => Environment.GetEnvironmentVariable("TASKS_TABLE") ?? "TaskMonk-Tasks";
        public static string CommentsTable => Environment.GetEnvironmentVariable("COMMENTS_TABLE") ?? "TaskMonk-Comments";
        
        // DynamoDB Index Names
        public const string TasksByTeamIndex = "TeamId-CreatedAt-index";
        public const string TasksByAssigneeIndex = "AssignedTo-CreatedAt-index";
        public const string CommentsByTaskIndex = "TaskId-CreatedAt-index";
        
        // Error Messages
        public const string InvalidInputError = "Invalid input parameters";
        public const string UnauthorizedError = "Unauthorized access";
        public const string ResourceNotFoundError = "Resource not found";
        public const string InternalServerError = "Internal server error";
        
        // EventBridge Event Sources
        public const string TaskCreatedEvent = "taskmonk.task.created";
        public const string TaskAssignedEvent = "taskmonk.task.assigned";
        public const string TaskStatusChangedEvent = "taskmonk.task.statuschanged";
        public const string TaskDeadlineApproachingEvent = "taskmonk.task.deadlineapproaching";
        
        // Environment
        public static string Environment => System.Environment.GetEnvironmentVariable("ENVIRONMENT") ?? "dev";
        
        // Frontend URLs
        public static string FrontendBaseUrl => Environment switch
        {
            "prod" => "https://taskmonk.com",
            "test" => "https://test.taskmonk.com",
            _ => "https://dev.taskmonk.com"
        };
    }
}