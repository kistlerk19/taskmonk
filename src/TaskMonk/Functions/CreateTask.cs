using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;

namespace TaskMonk.Functions
{
    public class CreateTask
    {
        private readonly DynamoDbService _dynamoDbService;
        private readonly EmailService _emailService;
        private readonly IAmazonEventBridge _eventBridgeClient;
        
        public CreateTask()
        {
            _dynamoDbService = new DynamoDbService();
            _emailService = new EmailService();
            _eventBridgeClient = new AmazonEventBridgeClient();
        }
        
        public CreateTask(DynamoDbService dynamoDbService, EmailService emailService, IAmazonEventBridge eventBridgeClient)
        {
            _dynamoDbService = dynamoDbService;
            _emailService = emailService;
            _eventBridgeClient = eventBridgeClient;
        }
        
        public async System.Threading.Tasks.Task<APIGatewayProxyResponse> FunctionHandler(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing create task request");
                
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
                var taskRequest = JsonSerializer.Deserialize<Models.Task>(request.Body);
                if (taskRequest == null)
                {
                    return CreateResponse(400, ApiResponse<string>.Error(Constants.InvalidInputError));
                }
                
                // Validate task input
                if (!ValidationHelper.IsValidTaskTitle(taskRequest.Title) || 
                    !ValidationHelper.IsValidTaskDescription(taskRequest.Description) ||
                    !ValidationHelper.IsValidDeadline(taskRequest.Deadline) ||
                    string.IsNullOrEmpty(taskRequest.TeamId))
                {
                    return CreateResponse(400, ApiResponse<string>.Error("Invalid task information. Please check all fields."));
                }
                
                // Verify team exists and user is a member
                var team = await _dynamoDbService.GetItemAsync<Team>(
                    Constants.TeamsTable, 
                    "teamId", 
                    taskRequest.TeamId);
                    
                if (team == null)
                {
                    return CreateResponse(404, ApiResponse<string>.Error("Team not found"));
                }
                
                if (!team.Members.Contains(userId))
                {
                    return CreateResponse(403, ApiResponse<string>.Error("You are not a member of this team"));
                }
                
                // Create new task
                var newTask = new Models.Task
                {
                    TaskId = Guid.NewGuid().ToString(),
                    Title = taskRequest.Title,
                    Description = taskRequest.Description,
                    Status = Models.TaskStatus.Todo,
                    Priority = taskRequest.Priority,
                    AssignedTo = taskRequest.AssignedTo,
                    TeamId = taskRequest.TeamId,
                    CreatedBy = userId,
                    Deadline = taskRequest.Deadline,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                // Save task to DynamoDB
                await _dynamoDbService.PutItemAsync(Constants.TasksTable, newTask);
                
                // If task is assigned to someone, send notification
                if (!string.IsNullOrEmpty(newTask.AssignedTo))
                {
                    // Get assignee information
                    var assignee = await _dynamoDbService.GetItemAsync<User>(
                        Constants.UsersTable, 
                        "userId", 
                        newTask.AssignedTo);
                        
                    if (assignee != null)
                    {
                        // Get creator information
                        var creator = await _dynamoDbService.GetItemAsync<User>(
                            Constants.UsersTable, 
                            "userId", 
                            userId);
                            
                        if (creator != null)
                        {
                            string creatorName = $"{creator.FirstName} {creator.LastName}";
                            
                            // Send email notification
                            await _emailService.SendTaskAssignmentNotificationAsync(
                                assignee.Email,
                                newTask.Title,
                                newTask.TaskId,
                                creatorName);
                                
                            // Publish task assigned event
                            await PublishTaskEvent(Constants.TaskAssignedEvent, newTask);
                        }
                    }
                }
                
                // Publish task created event
                await PublishTaskEvent(Constants.TaskCreatedEvent, newTask);
                
                // Return success response
                return CreateResponse(201, ApiResponse<Models.Task>.Ok(newTask, "Task created successfully"));
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error creating task: {ex.Message}");
                return CreateResponse(500, ApiResponse<string>.Error(Constants.InternalServerError));
            }
        }
        
        private async System.Threading.Tasks.Task PublishTaskEvent(string eventType, Models.Task task)
        {
            try
            {
                var eventDetail = JsonSerializer.Serialize(task);
                
                var putEventsRequest = new PutEventsRequest
                {
                    Entries = new List<PutEventsRequestEntry>
                    {
                        new PutEventsRequestEntry
                        {
                            Source = "taskmonk.tasks",
                            DetailType = eventType,
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