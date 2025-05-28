using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using Amazon.DynamoDBv2.Model;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class InviteToTeam
    {
        private readonly DynamoDbService _dynamoDbService;
        private readonly EmailService _emailService;
        
        public InviteToTeam()
        {
            _dynamoDbService = new DynamoDbService();
            _emailService = new EmailService();
        }
        
        public InviteToTeam(DynamoDbService dynamoDbService, EmailService emailService)
        {
            _dynamoDbService = dynamoDbService;
            _emailService = emailService;
        }
        
        public class InviteRequest
        {
            public string TeamId { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing team invitation request");
                
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
                var inviteRequest = JsonSerializer.Deserialize<InviteRequest>(request.Body);
                if (inviteRequest == null || string.IsNullOrEmpty(inviteRequest.TeamId) || 
                    !ValidationHelper.IsValidEmail(inviteRequest.Email))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Invalid invitation request"));
                }
                
                // Get team information
                var team = await _dynamoDbService.GetItemAsync<Team>(
                    Constants.TeamsTable, 
                    "teamId", 
                    inviteRequest.TeamId);
                    
                if (team == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Team not found"));
                }
                
                // Verify user is team owner or member
                if (team.OwnerId != userId && !team.Members.Contains(userId))
                {
                    return CreateResponse(403, ApiResponse<string>.Error("You don't have permission to invite users to this team"));
                }
                
                // Get inviter information
                var inviter = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    userId);
                    
                if (inviter == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Inviter user not found"));
                }
                
                // Check if invited user already exists
                var invitedUser = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "email", 
                    inviteRequest.Email);
                
                // Generate invite code
                string inviteCode = Guid.NewGuid().ToString();
                
                if (invitedUser != null)
                {
                    // If user already exists, add them directly to the team
                    if (!team.Members.Contains(invitedUser.UserId))
                    {
                        team.Members.Add(invitedUser.UserId);
                        team.UpdatedAt = DateTime.UtcNow;
                        await _dynamoDbService.PutItemAsync(Constants.TeamsTable, team);
                        
                        // Update user's teams list
                        invitedUser.Teams.Add(team.TeamId);
                        invitedUser.UpdatedAt = DateTime.UtcNow;
                        await _dynamoDbService.PutItemAsync(Constants.UsersTable, invitedUser);
                    }
                    else
                    {
                        return CreateResponse(400, ApiResponse<string>.Error("User is already a member of this team"));
                    }
                }
                
                // Send invitation email
                string inviterName = $"{inviter.FirstName} {inviter.LastName}";
                await _emailService.SendTeamInvitationAsync(
                    inviteRequest.Email,
                    team.Name,
                    inviterName,
                    inviteCode);
                
                return CreateResponse(200, ApiResponse<string>.Ok("Invitation sent successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error inviting to team: {ex.Message}");
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