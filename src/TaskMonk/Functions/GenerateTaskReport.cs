using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class GenerateTaskReport
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public GenerateTaskReport()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public GenerateTaskReport(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public class ReportRequest
        {
            [JsonPropertyName("teamId")]
            public string? TeamId { get; set; }
            
            [JsonPropertyName("startDate")]
            public DateTime StartDate { get; set; }
            
            [JsonPropertyName("endDate")]
            public DateTime EndDate { get; set; }
            
            [JsonPropertyName("reportType")]
            public string ReportType { get; set; } = "summary"; // summary, detailed, performance
        }
        
        public class TaskReportSummary
        {
            [JsonPropertyName("totalTasks")]
            public int TotalTasks { get; set; }
            
            [JsonPropertyName("completedTasks")]
            public int CompletedTasks { get; set; }
            
            [JsonPropertyName("completionRate")]
            public double CompletionRate { get; set; }
            
            [JsonPropertyName("averageCompletionTime")]
            public double AverageCompletionTime { get; set; } // in days
            
            [JsonPropertyName("tasksByStatus")]
            public Dictionary<string, int> TasksByStatus { get; set; } = new Dictionary<string, int>();
            
            [JsonPropertyName("tasksByPriority")]
            public Dictionary<string, int> TasksByPriority { get; set; } = new Dictionary<string, int>();
            
            [JsonPropertyName("tasksByDay")]
            public Dictionary<string, TaskDayStats> TasksByDay { get; set; } = new Dictionary<string, TaskDayStats>();
        }
        
        public class TaskDayStats
        {
            [JsonPropertyName("created")]
            public int Created { get; set; }
            
            [JsonPropertyName("completed")]
            public int Completed { get; set; }
        }
        
        public class UserPerformance
        {
            [JsonPropertyName("userId")]
            public string UserId { get; set; } = string.Empty;
            
            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;
            
            [JsonPropertyName("tasksAssigned")]
            public int TasksAssigned { get; set; }
            
            [JsonPropertyName("tasksCompleted")]
            public int TasksCompleted { get; set; }
            
            [JsonPropertyName("completionRate")]
            public double CompletionRate { get; set; }
            
            [JsonPropertyName("averageCompletionTime")]
            public double AverageCompletionTime { get; set; } // in days
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing generate task report request");
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Parse report parameters
                if (string.IsNullOrEmpty(request.Body))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Report parameters are required"));
                }
                
                var reportRequest = JsonSerializer.Deserialize<ReportRequest>(request.Body);
                if (reportRequest == null)
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Invalid report parameters"));
                }
                
                // Validate date range
                if (reportRequest.EndDate <= reportRequest.StartDate)
                {
                    return CreateResponse(400, ApiResponse<string>.Error("End date must be after start date"));
                }
                
                List<Models.Task> tasks = new List<Models.Task>();
                
                // If teamId is specified, check if user is a member
                if (!string.IsNullOrEmpty(reportRequest.TeamId))
                {
                    var team = await _dynamoDbService.GetItemAsync<Team>(
                        Constants.TeamsTable, 
                        "teamId", 
                        reportRequest.TeamId);
                        
                    if (team == null)
                    {
                        return CreateResponse(404, ApiResponse<string>.Error("Team not found"));
                    }
                    
                    if (!team.Members.Contains(userId))
                    {
                        return CreateResponse(403, ApiResponse<string>.Error("You are not a member of this team"));
                    }
                    
                    // Get tasks for the specified team
                    var teamTasks = await _dynamoDbService.QueryAsync<Models.Task>(
                        Constants.TasksTable,
                        Constants.TasksByTeamIndex,
                        "teamId",
                        reportRequest.TeamId);
                        
                    tasks.AddRange(teamTasks);
                }
                else
                {
                    // Get user's teams
                    var user = await _dynamoDbService.GetItemAsync<User>(
                        Constants.UsersTable, 
                        "userId", 
                        userId);
                        
                    if (user == null)
                    {
                        return CreateResponse(404, ApiResponse<string>.Error("User not found"));
                    }
                    
                    // Get tasks for all teams the user is a member of
                    foreach (var teamId in user.Teams)
                    {
                        var teamTasks = await _dynamoDbService.QueryAsync<Models.Task>(
                            Constants.TasksTable,
                            Constants.TasksByTeamIndex,
                            "teamId",
                            teamId);
                            
                        tasks.AddRange(teamTasks);
                    }
                }
                
                // Filter tasks by date range
                tasks = tasks.Where(t => 
                    t.CreatedAt >= reportRequest.StartDate && 
                    t.CreatedAt <= reportRequest.EndDate
                ).ToList();
                
                // Generate report based on type
                switch (reportRequest.ReportType.ToLower())
                {
                    case "summary":
                        var summary = GenerateSummaryReport(tasks);
                        return CreateResponse(200, ApiResponse<TaskReportSummary>.Ok(summary, "Report generated successfully"));
                        
                    case "performance":
                        var performance = await GeneratePerformanceReport(tasks);
                        return CreateResponse(200, ApiResponse<List<UserPerformance>>.Ok(performance, "Report generated successfully"));
                        
                    default:
                        return CreateResponse(400, ApiResponse<string>.Error("Invalid report type"));
                }
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error generating report: {ex.Message}");
                return CreateResponse(500, ApiResponse<string>.Error(Constants.InternalServerError));
            }
        }
        
        private TaskReportSummary GenerateSummaryReport(List<Models.Task> tasks)
        {
            var summary = new TaskReportSummary
            {
                TotalTasks = tasks.Count,
                CompletedTasks = tasks.Count(t => t.Status == TaskStatus.Done)
            };
            
            // Calculate completion rate
            summary.CompletionRate = summary.TotalTasks > 0 
                ? Math.Round((double)summary.CompletedTasks / summary.TotalTasks * 100, 2) 
                : 0;
            
            // Calculate average completion time for completed tasks
            var completedTasks = tasks.Where(t => t.Status == TaskStatus.Done).ToList();
            if (completedTasks.Any())
            {
                double totalDays = 0;
                foreach (var task in completedTasks)
                {
                    // Assuming UpdatedAt reflects when the task was completed
                    var completionTime = task.UpdatedAt - task.CreatedAt;
                    totalDays += completionTime.TotalDays;
                }
                
                summary.AverageCompletionTime = Math.Round(totalDays / completedTasks.Count, 1);
            }
            
            // Count tasks by status
            foreach (var status in Enum.GetValues(typeof(TaskStatus)))
            {
                var statusName = status.ToString();
                var count = tasks.Count(t => t.Status.ToString() == statusName);
                summary.TasksByStatus[statusName] = count;
            }
            
            // Count tasks by priority
            foreach (var priority in Enum.GetValues(typeof(TaskPriority)))
            {
                var priorityName = priority.ToString();
                var count = tasks.Count(t => t.Priority.ToString() == priorityName);
                summary.TasksByPriority[priorityName] = count;
            }
            
            // Group tasks by day
            var tasksByDay = tasks.GroupBy(t => t.CreatedAt.Date);
            foreach (var group in tasksByDay)
            {
                var dateKey = group.Key.ToString("yyyy-MM-dd");
                var created = group.Count();
                var completed = group.Count(t => t.Status == TaskStatus.Done);
                
                summary.TasksByDay[dateKey] = new TaskDayStats
                {
                    Created = created,
                    Completed = completed
                };
            }
            
            return summary;
        }
        
        private async Task<List<UserPerformance>> GeneratePerformanceReport(List<Models.Task> tasks)
        {
            var userPerformance = new Dictionary<string, UserPerformance>();
            
            // Get unique user IDs from tasks
            var userIds = tasks
                .Where(t => !string.IsNullOrEmpty(t.AssignedTo))
                .Select(t => t.AssignedTo)
                .Distinct()
                .ToList();
            
            // Get user details
            foreach (var userId in userIds)
            {
                var user = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    userId);
                    
                if (user != null)
                {
                    userPerformance[userId] = new UserPerformance
                    {
                        UserId = userId,
                        Name = $"{user.FirstName} {user.LastName}",
                        TasksAssigned = 0,
                        TasksCompleted = 0,
                        CompletionRate = 0,
                        AverageCompletionTime = 0
                    };
                }
            }
            
            // Calculate performance metrics
            foreach (var task in tasks.Where(t => !string.IsNullOrEmpty(t.AssignedTo)))
            {
                var userId = task.AssignedTo;
                
                if (userPerformance.ContainsKey(userId))
                {
                    userPerformance[userId].TasksAssigned++;
                    
                    if (task.Status == TaskStatus.Done)
                    {
                        userPerformance[userId].TasksCompleted++;
                        
                        // Calculate completion time
                        var completionTime = task.UpdatedAt - task.CreatedAt;
                        userPerformance[userId].AverageCompletionTime += completionTime.TotalDays;
                    }
                }
            }
            
            // Calculate averages and rates
            foreach (var userId in userPerformance.Keys)
            {
                var performance = userPerformance[userId];
                
                // Calculate completion rate
                performance.CompletionRate = performance.TasksAssigned > 0 
                    ? Math.Round((double)performance.TasksCompleted / performance.TasksAssigned * 100, 2) 
                    : 0;
                
                // Calculate average completion time
                performance.AverageCompletionTime = performance.TasksCompleted > 0 
                    ? Math.Round(performance.AverageCompletionTime / performance.TasksCompleted, 1) 
                    : 0;
            }
            
            return userPerformance.Values.ToList();
        }
        
        private string GetUserIdFromClaims(APIGatewayProxyRequest request)
        {
            try
            {
                if (request.RequestContext?.Authorizer?.Claims != null &&
                    request.RequestContext.Authorizer.Claims.TryGetValue("sub", out var sub))
                {
                    return sub;
                }
                
                return null;
            }
            catch
            {
                return null;
            }
        }
        
        private APIGatewayProxyResponse CreateResponse<T>(int statusCode, ApiResponse<T> body)
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                Body = JsonSerializer.Serialize(body),
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" },
                    { "Access-Control-Allow-Origin", "*" }
                }
            };
        }
    }
}