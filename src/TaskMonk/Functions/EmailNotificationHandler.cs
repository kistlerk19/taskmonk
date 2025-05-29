using Amazon.Lambda.Core;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;

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
        
        // Use Dictionary<string, object> instead of EventBridgeEvent
        public async System.Threading.Tasks.Task FunctionHandler(Dictionary<string, object> eventData, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Processing event");
                
                // Extract event details
                string detailType = eventData["detail-type"]?.ToString();
                var detailJson = System.Text.Json.JsonSerializer.Serialize(eventData["detail"]);
                var detail = JsonDocument.Parse(detailJson).RootElement;
                
                switch (detailType)
                {
                    case var type when type == Constants.TaskStatusChangedEvent:
                        await HandleTaskStatusChangedEvent(detail, context);
                        break;
                        
                    case var type when type == Constants.TaskDeadlineApproachingEvent:
                        await HandleTaskDeadlineApproachingEvent(detail, context);
                        break;
                        
                    default:
                        context.Logger.LogInformation($"No handler for event type: {detailType}");
                        break;
                }
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error processing event: {ex.Message}");
            }
        }
        
        private async System.Threading.Tasks.Task HandleTaskStatusChangedEvent(JsonElement detail, ILambdaContext context)
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
                if (newStatus == Models.TaskStatus.Done.ToString() && task.CreatedBy != task.AssignedTo)
                {
                    await _emailService.SendEmailAsync(creator.Email, subject, htmlBody, textBody);
                }
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error handling task status changed event: {ex.Message}");
            }
        }
        
        private async System.Threading.Tasks.Task HandleTaskDeadlineApproachingEvent(JsonElement detail, ILambdaContext context)
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