using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Amazon.DynamoDBv2.Model;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class UpdateTaskStatus
    {
        private readonly DynamoDbService _dynamoDbService;
        private readonly IAmazonEventBridge _eventBridgeClient;
        
        public UpdateTaskStatus()
        {
            _dynamoDbService = new DynamoDbService();
            _eventBridgeClient = new AmazonEventBridgeClient();
        }
        
        public UpdateTaskStatus(DynamoDbService dynamoDbService, IAmazonEventBridge eventBridgeClient)
        {
            _dynamoDbService = dynamoDbService;
            _eventBridgeClient = eventBridgeClient;
        }
        
        public class UpdateTaskStatusRequest
        {
            public string TaskId { get; set; } = string.Empty;
            public TaskStatus Status { get; set; }
        }
        
        public async Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing update task status request");
                
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
                var updateRequest = JsonSerializer.Deserialize<UpdateTaskStatusRequest>(request.Body);
                if (updateRequest == null || string.IsNullOrEmpty(updateRequest.TaskId))
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Get task information
                var task = await _dynamoDbService.GetItemAsync<Models.Task>(
                    Constants.TasksTable, 
                    "taskId", 
                    updateRequest.TaskId);
                    
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
                
                // Update task status
                TaskStatus oldStatus = task.Status;
                task.Status = updateRequest.Status;
                task.UpdatedAt = DateTime.UtcNow;
                
                // Save updated task to DynamoDB
                var updates = new Dictionary<string, AttributeValue>
                {
                    { "status", new AttributeValue { S = updateRequest.Status.ToString() } },
                    { "updatedAt", new AttributeValue { S = task.UpdatedAt.ToString("o") } }
                };
                
                await _dynamoDbService.UpdateItemAsync(
                    Constants.TasksTable,
                    "taskId",
                    task.TaskId,
                    updates);
                
                // Publish task status changed event
                await PublishTaskStatusChangedEvent(task, oldStatus);
                
                // Return success response
                return CreateResponse(200, ApiResponse<Models.Task>.Ok(task, "Task status updated successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error updating task status: {ex.Message}");
                return CreateResponse(500, ApiResponse<string>.Error(Constants.InternalServerError));
            }
        }
        
        private async Task PublishTaskStatusChangedEvent(Models.Task task, TaskStatus oldStatus)
        {
            try
            {
                var eventDetail = JsonSerializer.Serialize(new
                {
                    task,
                    oldStatus = oldStatus.ToString(),
                    newStatus = task.Status.ToString()
                });
                
                var putEventsRequest = new PutEventsRequest
                {
                    Entries = new List<PutEventsRequestEntry>
                    {
                        new PutEventsRequestEntry
                        {
                            Source = "taskmonk.tasks",
                            DetailType = Constants.TaskStatusChangedEvent,
                            Detail = eventDetail,
                            EventBusName = "default"
                        }
                    }
                };
                
                await _eventBridgeClient.PutEventsAsync(putEventsRequest);
            }
            catch (Exception)
            {
                // Log but don't fail the main function if event publishing fails
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