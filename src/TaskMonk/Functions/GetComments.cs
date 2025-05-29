using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.

namespace TaskMonk.Functions
{
    public class GetComments
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public GetComments()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public GetComments(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing get comments request");
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Get task ID from path parameters
                if (!request.PathParameters.TryGetValue("taskId", out var taskId) || string.IsNullOrEmpty(taskId))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Task ID is required"));
                }
                
                // Get task information
                var task = await _dynamoDbService.GetItemAsync<Models.Task>(
                    Constants.TasksTable, 
                    "taskId", 
                    taskId);
                    
                if (task == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Task not found"));
                }
                
                // Verify team exists and user is a member
                var team = await _dynamoDbService.GetItemAsync<Team>(
                    Constants.TeamsTable, 
                    "teamId", 
                    task.TeamId);
                    
                if (team == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Team not found"));
                }
                
                if (!team.Members.Contains(userId))
                {
                    return CreateResponse(403, ApiResponse<string>.Error("You are not a member of this team"));
                }
                
                // Query comments for the task
                var comments = await _dynamoDbService.QueryAsync<Comment>(
                    Constants.CommentsTable,
                    Constants.CommentsByTaskIndex,
                    "taskId",
                    taskId);
                
                // Return success response
                return CreateResponse(200, ApiResponse<List<Comment>>.Ok(comments, "Comments retrieved successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error getting comments: {ex.Message}");
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