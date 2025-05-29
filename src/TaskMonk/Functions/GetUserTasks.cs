using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.

namespace TaskMonk.Functions
{
    public class GetUserTasks
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public GetUserTasks()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public GetUserTasks(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing get user tasks request");
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Query tasks assigned to the user
                var tasks = await _dynamoDbService.QueryAsync<Models.Task>(
                    Constants.TasksTable,
                    Constants.TasksByAssigneeIndex,
                    "assignedTo",
                    userId);
                
                // Return success response
                return CreateResponse(200, ApiResponse<List<Models.Task>>.Ok(tasks, "Tasks retrieved successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error getting user tasks: {ex.Message}");
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