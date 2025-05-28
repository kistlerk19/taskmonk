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
    public class CreateTeam
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public CreateTeam()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public CreateTeam(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing create team request");
                
                // Validate request
                if (string.IsNullOrEmpty(request.Body))
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Get user ID from claims (assuming Cognito authentication)
                string userId = GetUserIdFromClaims(request);
                if (string.IsNullOrEmpty(userId))
                {
                    return CreateResponse(401, ApiResponse<string>.Error(Constants.UnauthorizedError));
                }
                
                // Parse request body
                var teamRequest = JsonSerializer.Deserialize<Team>(request.Body);
                if (teamRequest == null)
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Validate team input
                if (!ValidationHelper.IsValidTeamName(teamRequest.Name) || 
                    !ValidationHelper.IsValidTeamDescription(teamRequest.Description))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Invalid team information. Please check name and description fields."));
                }
                
                // Verify user exists
                var user = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    userId);
                    
                if (user == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("User not found"));
                }
                
                // Create new team
                var newTeam = new Team
                {
                    TeamId = Guid.NewGuid().ToString(),
                    Name = teamRequest.Name,
                    Description = teamRequest.Description,
                    OwnerId = userId,
                    Members = new List<string> { userId },
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                // Save team to DynamoDB
                await _dynamoDbService.PutItemAsync(Constants.TeamsTable, newTeam);
                
                // Update user's teams list
                user.Teams.Add(newTeam.TeamId);
                user.UpdatedAt = DateTime.UtcNow;
                await _dynamoDbService.PutItemAsync(Constants.UsersTable, user);
                
                // Return success response
                return CreateResponse(201, ApiResponse<Team>.Ok(newTeam, "Team created successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error creating team: {ex.Message}");
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