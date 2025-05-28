using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using Amazon.DynamoDBv2.Model;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class FilterTasks
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public FilterTasks()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public FilterTasks(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public class TaskFilterRequest
        {
            [JsonPropertyName("teamId")]
            public string? TeamId { get; set; }
            
            [JsonPropertyName("status")]
            public TaskStatus? Status { get; set; }
            
            [JsonPropertyName("priority")]
            public TaskPriority? Priority { get; set; }
            
            [JsonPropertyName("assignedTo")]
            public string? AssignedTo { get; set; }
            
            [JsonPropertyName("createdBy")]
            public string? CreatedBy { get; set; }
            
            [JsonPropertyName("startDate")]
            public DateTime? StartDate { get; set; }
            
            [JsonPropertyName("endDate")]
            public DateTime? EndDate { get; set; }
            
            [JsonPropertyName("searchTerm")]
            public string? SearchTerm { get; set; }
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing filter tasks request");
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Parse filter parameters
                TaskFilterRequest filterRequest;
                if (string.IsNullOrEmpty(request.Body))
                {
                    filterRequest = new TaskFilterRequest();
                }
                else
                {
                    filterRequest = JsonSerializer.Deserialize<TaskFilterRequest>(request.Body) ?? new TaskFilterRequest();
                }
                
                // Get user's teams
                var user = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    userId);
                    
                if (user == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("User not found"));
                }
                
                List<Models.Task> allTasks = new List<Models.Task>();
                
                // If teamId is specified, check if user is a member
                if (!string.IsNullOrEmpty(filterRequest.TeamId))
                {
                    var team = await _dynamoDbService.GetItemAsync<Team>(
                        Constants.TeamsTable, 
                        "teamId", 
                        filterRequest.TeamId);
                        
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
                        filterRequest.TeamId);
                        
                    allTasks.AddRange(teamTasks);
                }
                else
                {
                    // Get tasks for all teams the user is a member of
                    foreach (var teamId in user.Teams)
                    {
                        var teamTasks = await _dynamoDbService.QueryAsync<Models.Task>(
                            Constants.TasksTable,
                            Constants.TasksByTeamIndex,
                            "teamId",
                            teamId);
                            
                        allTasks.AddRange(teamTasks);
                    }
                }
                
                // Apply filters
                var filteredTasks = allTasks;
                
                // Filter by status
                if (filterRequest.Status.HasValue)
                {
                    filteredTasks = filteredTasks.Where(t => t.Status == filterRequest.Status.Value).ToList();
                }
                
                // Filter by priority
                if (filterRequest.Priority.HasValue)
                {
                    filteredTasks = filteredTasks.Where(t => t.Priority == filterRequest.Priority.Value).ToList();
                }
                
                // Filter by assignee
                if (!string.IsNullOrEmpty(filterRequest.AssignedTo))
                {
                    filteredTasks = filteredTasks.Where(t => t.AssignedTo == filterRequest.AssignedTo).ToList();
                }
                
                // Filter by creator
                if (!string.IsNullOrEmpty(filterRequest.CreatedBy))
                {
                    filteredTasks = filteredTasks.Where(t => t.CreatedBy == filterRequest.CreatedBy).ToList();
                }
                
                // Filter by date range
                if (filterRequest.StartDate.HasValue)
                {
                    filteredTasks = filteredTasks.Where(t => t.CreatedAt >= filterRequest.StartDate.Value).ToList();
                }
                
                if (filterRequest.EndDate.HasValue)
                {
                    filteredTasks = filteredTasks.Where(t => t.CreatedAt <= filterRequest.EndDate.Value).ToList();
                }
                
                // Filter by search term (in title or description)
                if (!string.IsNullOrEmpty(filterRequest.SearchTerm))
                {
                    string searchTerm = filterRequest.SearchTerm.ToLower();
                    filteredTasks = filteredTasks.Where(t => 
                        t.Title.ToLower().Contains(searchTerm) || 
                        t.Description.ToLower().Contains(searchTerm)
                    ).ToList();
                }
                
                // Return filtered tasks
                return CreateResponse(200, ApiResponse<List<Models.Task>>.Ok(filteredTasks, "Tasks filtered successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error filtering tasks: {ex.Message}");
                return CreateResponse(500, ApiResponse<string>.Error(Constants.InternalServerError));
            }
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