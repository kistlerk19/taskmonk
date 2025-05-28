using Amazon.Lambda.Core;
using Amazon.Lambda.EventBridgeEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class EmailNotificationHandler
    {
        private readonly DynamoDbService _dynamoDbService;
        private readonly EmailService _emailService;
        
        public EmailNotificationHandler()
        {
            _dynamoDbService = new DynamoDbService();
            _emailService = new EmailService();
        }
        
        public EmailNotificationHandler(DynamoDbService dynamoDbService, EmailService emailService)
        {
            _dynamoDbService = dynamoDbService;
            _emailService = emailService;
        }
        
        public async Task FunctionHandler(EventBridgeEvent<JsonElement> evnt, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation($"Processing event: {evnt.DetailType}");
                
                switch (evnt.DetailType)
                {
                    case var type when type == Constants.TaskStatusChangedEvent:
                        await HandleTaskStatusChangedEvent(evnt.Detail, context);
                        break;
                        
                    case var type when type == Constants.TaskDeadlineApproachingEvent:
                        await HandleTaskDeadlineApproachingEvent(evnt.Detail, context);
                        break;
                        
                    default:
                        context.Logger.LogInformation($"No handler for event type: {evnt.DetailType}");
                        break;
                }
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error processing event: {ex.Message}");
            }
        }
        
        private async Task HandleTaskStatusChangedEvent(JsonElement detail, ILambdaContext context)
        {
            try
            {
                // Extract task information from event
                var task = detail.GetProperty("task").Deserialize<Models.Task>();
                var oldStatus = detail.GetProperty("oldStatus").GetString();
                var newStatus = detail.GetProperty("newStatus").GetString();
                
                if (task == null || string.IsNullOrEmpty(task.AssignedTo))
                {
                    return;
                }
                
                // Get assignee information
                var assignee = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    task.AssignedTo);
                    
                if (assignee == null)
                {
                    return;
                }
                
                // Get creator information
                var creator = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    task.CreatedBy);
                    
                if (creator == null)
                {
                    return;
                }
                
                // Send email notification about status change
                var subject = $"Task Status Updated: {task.Title}";
                var htmlBody = $@"
                    <html>
                    <head></head>
                    <body>
                        <h1>Task Status Update</h1>
                        <p>The status of task <strong>{task.Title}</strong> has been changed from <strong>{oldStatus}</strong> to <strong>{newStatus}</strong>.</p>
                        <p>Click <a href='https://taskmonk.com/tasks/{task.TaskId}'>here</a> to view the task details.</p>
                    </body>
                    </html>";
                    
                var textBody = $@"
                    Task Status Update
                    
                    The status of task {task.Title} has been changed from {oldStatus} to {newStatus}.
                    
                    View the task at: https://taskmonk.com/tasks/{task.TaskId}";
                    
                await _emailService.SendEmailAsync(assignee.Email, subject, htmlBody, textBody);
                
                // If task is marked as done, notify the creator as well
                if (newStatus == TaskStatus.Done.ToString() && task.CreatedBy != task.AssignedTo)
                {
                    await _emailService.SendEmailAsync(creator.Email, subject, htmlBody, textBody);
                }
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error handling task status changed event: {ex.Message}");
            }
        }
        
        private async Task HandleTaskDeadlineApproachingEvent(JsonElement detail, ILambdaContext context)
        {
            try
            {
                // Extract task information from event
                var task = detail.Deserialize<Models.Task>();
                
                if (task == null || string.IsNullOrEmpty(task.AssignedTo) || !task.Deadline.HasValue)
                {
                    return;
                }
                
                // Get assignee information
                var assignee = await _dynamoDbService.GetItemAsync<User>(
                    Constants.UsersTable, 
                    "userId", 
                    task.AssignedTo);
                    
                if (assignee == null)
                {
                    return;
                }
                
                // Send deadline reminder email
                await _emailService.SendTaskDeadlineReminderAsync(
                    assignee.Email,
                    task.Title,
                    task.TaskId,
                    task.Deadline.Value);
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error handling task deadline approaching event: {ex.Message}");
            }
        }
    }
}