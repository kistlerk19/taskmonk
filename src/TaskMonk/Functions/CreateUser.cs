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
    public class CreateUser
    {
        private readonly DynamoDbService _dynamoDbService;
        
        public CreateUser()
        {
            _dynamoDbService = new DynamoDbService();
        }
        
        public CreateUser(DynamoDbService dynamoDbService)
        {
            _dynamoDbService = dynamoDbService;
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing create user request");
                
                // Validate request
                if (string.IsNullOrEmpty(request.Body))
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Parse request body
                var userRequest = JsonSerializer.Deserialize<User>(request.Body);
                if (userRequest == null)
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Validate user input
                if (!ValidationHelper.IsValidEmail(userRequest.Email) || 
                    !ValidationHelper.IsValidName(userRequest.FirstName) || 
                    !ValidationHelper.IsValidName(userRequest.LastName))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Invalid user information. Please check email and name fields."));
                }
                
                // Check if user already exists
                var existingUser = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "email", 
                    userRequest.Email);
                    
                if (existingUser != null)
                {
                    return CreateResponse(409, ApiResponse<string>.Error("User with this email already exists"));
                }
                
                // Create new user
                var newUser = new User
                {
                    UserId = Guid.NewGuid().ToString(),
                    Email = userRequest.Email,
                    FirstName = userRequest.FirstName,
                    LastName = userRequest.LastName,
                    Teams = new List<string>(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                // Save to DynamoDB
                await _dynamoDbService.PutItemAsync(Constants.UsersTable, newUser);
                
                // Return success response
                return CreateResponse(201, ApiResponse<User>.Ok(newUser, "User created successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error creating user: {ex.Message}");
                return CreateResponse(500, ApiResponse<string>.Error(Constants.InternalServerError));
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