using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class GetTeamTasks
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public GetTeamTasks()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public GetTeamTasks(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing get team tasks request");
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Get team ID from path parameters
                if (!request.PathParameters.TryGetValue("teamId", out var teamId) || string.IsNullOrEmpty(teamId))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Team ID is required"));
                }
                
                // Verify team exists and user is a member
                var team = await _dynamoDbService.GetItemAsync<Team>(
                    Constants.TeamsTable, 
                    "teamId", 
                    teamId);
                    
                if (team == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Team not found"));
                }
                
                if (!team.Members.Contains(userId))
                {
                    return CreateResponse(403, ApiResponse<string>.Error("You are not a member of this team"));
                }
                
                // Query tasks for the team
                var tasks = await _dynamoDbService.QueryAsync<Models.Task>(
                    Constants.TasksTable,
                    Constants.TasksByTeamIndex,
                    "teamId",
                    teamId);
                
                // Return success response
                return CreateResponse(200, ApiResponse<List<Models.Task>>.Ok(tasks, "Team tasks retrieved successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error getting team tasks: {ex.Message}");
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