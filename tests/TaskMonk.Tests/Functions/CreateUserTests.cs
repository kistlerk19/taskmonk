using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using Moq;
using System.Text.Json;
using TaskMonk.Functions;
using TaskMonk.Models;
using TaskMonk.Services;
using Xunit;

namespace TaskMonk.Tests.Functions
{
    public class CreateUserTests
    {
        private readonly Mock<DynamoDbService> _mockDynamoDbService;
        private readonly CreateUser _function;
        private readonly TestLambdaContext _context;

        public CreateUserTests()
        {
            _mockDynamoDbService = new Mock<DynamoDbService>();
            _function = new CreateUser(_mockDynamoDbService.Object);
            _context = new TestLambdaContext();
        }

        [Fact]
        public async Task FunctionHandler_ValidRequest_ReturnsCreatedResponse()
        {
            // Arrange
            var user = new User
            {
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User"
            };

            var request = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(user)
            };

            _mockDynamoDbService
                .Setup(m => m.GetItemAsync<User>(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync((User)null);

            _mockDynamoDbService
                .Setup(m => m.PutItemAsync(It.IsAny<string>(), It.IsAny<User>()))
                .ReturnsAsync(true);

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.Equal(201, response.StatusCode);
            var responseBody = JsonSerializer.Deserialize<ApiResponse<User>>(response.Body);
            Assert.True(responseBody.Success);
            Assert.Equal("User created successfully", responseBody.Message);
            Assert.NotNull(responseBody.Data);
            Assert.Equal(user.Email, responseBody.Data.Email);
        }

        [Fact]
        public async Task FunctionHandler_UserAlreadyExists_ReturnsConflictResponse()
        {
            // Arrange
            var user = new User
            {
                Email = "existing@example.com",
                FirstName = "Existing",
                LastName = "User"
            };

            var request = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(user)
            };

            _mockDynamoDbService
                .Setup(m => m.GetItemAsync<User>(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(user);

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.Equal(409, response.StatusCode);
            var responseBody = JsonSerializer.Deserialize<ApiResponse<string>>(response.Body);
            Assert.False(responseBody.Success);
            Assert.Equal("User with this email already exists", responseBody.Message);
        }

        [Fact]
        public async Task FunctionHandler_InvalidEmail_ReturnsBadRequestResponse()
        {
            // Arrange
            var user = new User
            {
                Email = "invalid-email",
                FirstName = "Test",
                LastName = "User"
            };

            var request = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(user)
            };

            // Act
            var response = await _function.FunctionHandler(request, _context);

            // Assert
            Assert.Equal(400, response.StatusCode);
            var responseBody = JsonSerializer.Deserialize<ApiResponse<string>>(response.Body);
            Assert.False(responseBody.Success);
            Assert.Contains("Invalid user information", responseBody.Message);
        }
    }
}