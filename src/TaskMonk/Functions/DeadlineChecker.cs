using Amazon.Lambda.Core;
using Amazon.Lambda.CloudWatchEvents;
using System.Text.Json;
using TaskMonk.Models;
using TaskMonk.Services;
using TaskMonk.Utils;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TaskMonk.Functions
{
    public class DeadlineChecker
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly IAmazonEventBridge _eventBridgeClient;
        
        public DeadlineChecker()
        {
            _dynamoDbClient = new AmazonDynamoDBClient();
            _eventBridgeClient = new AmazonEventBridgeClient();
        }
        
        public DeadlineChecker(IAmazonDynamoDB dynamoDbClient, IAmazonEventBridge eventBridgeClient)
        {
            _dynamoDbClient = dynamoDbClient;
            _eventBridgeClient = eventBridgeClient;
        }
        
        public async Task FunctionHandler(CloudWatchEvent<object> evnt, ILambdaContext context)
        {
            try
            {
                context.Logger.LogInformation("Starting deadline check");
                
                // Calculate the date range for approaching deadlines (next 24 hours)
                var now = DateTime.UtcNow;
                var tomorrow = now.AddDays(1);
                
                // Scan for tasks with approaching deadlines
                var scanRequest = new ScanRequest
                {
                    TableName = Constants.TasksTable,
                    FilterExpression = "deadline BETWEEN :now AND :tomorrow AND #status <> :done",
                    ExpressionAttributeNames = new Dictionary<string, string>
                    {
                        { "#status", "status" }
                    },
                    ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                    {
                        { ":now", new AttributeValue { S = now.ToString("o") } },
                        { ":tomorrow", new AttributeValue { S = tomorrow.ToString("o") } },
                        { ":done", new AttributeValue { S = TaskStatus.Done.ToString() } }
                    }
                };
                
                var response = await _dynamoDbClient.ScanAsync(scanRequest);
                
                context.Logger.LogInformation($"Found {response.Items.Count} tasks with approaching deadlines");
                
                // Process each task with approaching deadline
                foreach (var item in response.Items)
                {
                    try
                    {
                        // Convert DynamoDB item to Task object
                        var task = ConvertDynamoItemToTask(item);
                        
                        if (task != null && !string.IsNullOrEmpty(task.AssignedTo))
                        {
                            // Publish deadline approaching event
                            await PublishDeadlineApproachingEvent(task);
                        }
                    }
                    catch (Exception ex)
                    {
                        context.Logger.LogError($"Error processing task: {ex.Message}");
                    }
                }
                
                context.Logger.LogInformation("Deadline check completed");
            }
            catch (Exception ex)
            {
                context.Logger.LogError($"Error checking deadlines: {ex.Message}");
            }
        }
        
        private Models.Task ConvertDynamoItemToTask(Dictionary<string, AttributeValue> item)
        {
            try
            {
                var task = new Models.Task
                {
                    TaskId = item.TryGetValue("taskId", out var taskId) ? taskId.S : string.Empty,
                    Title = item.TryGetValue("title", out var title) ? title.S : string.Empty,
                    Description = item.TryGetValue("description", out var description) ? description.S : string.Empty,
                    AssignedTo = item.TryGetValue("assignedTo", out var assignedTo) ? assignedTo.S : null,
                    TeamId = item.TryGetValue("teamId", out var teamId) ? teamId.S : string.Empty,
                    CreatedBy = item.TryGetValue("createdBy", out var createdBy) ? createdBy.S : string.Empty
                };
                
                if (item.TryGetValue("status", out var status))
                {
                    if (Enum.TryParse<TaskStatus>(status.S, out var taskStatus))
                    {
                        task.Status = taskStatus;
                    }
                }
                
                if (item.TryGetValue("priority", out var priority))
                {
                    if (Enum.TryParse<TaskPriority>(priority.S, out var taskPriority))
                    {
                        task.Priority = taskPriority;
                    }
                }
                
                if (item.TryGetValue("deadline", out var deadline) && DateTime.TryParse(deadline.S, out var deadlineDate))
                {
                    task.Deadline = deadlineDate;
                }
                
                if (item.TryGetValue("createdAt", out var createdAt) && DateTime.TryParse(createdAt.S, out var createdAtDate))
                {
                    task.CreatedAt = createdAtDate;
                }
                
                if (item.TryGetValue("updatedAt", out var updatedAt) && DateTime.TryParse(updatedAt.S, out var updatedAtDate))
                {
                    task.UpdatedAt = updatedAtDate;
                }
                
                return task;
            }
            catch
            {
                return null;
            }
        }
        
        private async Task PublishDeadlineApproachingEvent(Models.Task task)
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
                            DetailType = Constants.TaskDeadlineApproachingEvent,
                            Detail = eventDetail,
                            EventBusName = "default"
                        }
                    }
                };
                
                await _eventBridgeClient.PutEventsAsync(putEventsRequest);
            }
            catch
            {
                // Log but continue processing other tasks
            }
        }
    }
}