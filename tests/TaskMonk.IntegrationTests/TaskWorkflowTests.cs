using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.TestUtilities;
using System.Text.Json;
using TaskMonk.Functions;
using TaskMonk.Models;
using TaskMonk.Services;
using Xunit;

namespace TaskMonk.IntegrationTests
{
    public class TaskWorkflowTests : IDisposable
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly DynamoDbService _dynamoDbService;
        private readonly TestLambdaContext _context;
        private readonly string _testUserId;
        private readonly string _testTeamId;
        private readonly string _testTaskId;

        public TaskWorkflowTests()
        {
            // Use LocalStack or DynamoDB Local for integration tests
            _dynamoDbClient = new AmazonDynamoDBClient(new AmazonDynamoDBConfig
            {
                ServiceURL = Environment.GetEnvironmentVariable("DYNAMODB_LOCAL_URL") ?? "http://localhost:8000"
            });
            _dynamoDbService = new DynamoDbService(_dynamoDbClient);
            _context = new TestLambdaContext();
            _testUserId = Guid.NewGuid().ToString();
            _testTeamId = Guid.NewGuid().ToString();
            _testTaskId = Guid.NewGuid().ToString();

            // Set up test data
            SetupTestData().Wait();
        }

        private async Task SetupTestData()
        {
            // Create test tables if they don't exist
            await CreateTestTablesIfNotExist();

            // Create test user
            var user = new User
            {
                UserId = _testUserId,
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                Teams = new List<string> { _testTeamId }
            };
            await _dynamoDbService.PutItemAsync("TaskMonk-Users", user);

            // Create test team
            var team = new Team
            {
                TeamId = _testTeamId,
                Name = "Test Team",
                Description = "Test Team Description",
                OwnerId = _testUserId,
                Members = new List<string> { _testUserId }
            };
            await _dynamoDbService.PutItemAsync("TaskMonk-Teams", team);
        }

        private async Task CreateTestTablesIfNotExist()
        {
            try
            {
                var tables = await _dynamoDbClient.ListTablesAsync();
                
                if (!tables.TableNames.Contains("TaskMonk-Users"))
                {
                    await _dynamoDbClient.CreateTableAsync(new CreateTableRequest
                    {
                        TableName = "TaskMonk-Users",
                        AttributeDefinitions = new List<AttributeDefinition>
                        {
                            new AttributeDefinition("userId", ScalarAttributeType.S)
                        },
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement("userId", KeyType.HASH)
                        },
                        ProvisionedThroughput = new ProvisionedThroughput(1, 1)
                    });
                }

                if (!tables.TableNames.Contains("TaskMonk-Teams"))
                {
                    await _dynamoDbClient.CreateTableAsync(new CreateTableRequest
                    {
                        TableName = "TaskMonk-Teams",
                        AttributeDefinitions = new List<AttributeDefinition>
                        {
                            new AttributeDefinition("teamId", ScalarAttributeType.S)
                        },
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement("teamId", KeyType.HASH)
                        },
                        ProvisionedThroughput = new ProvisionedThroughput(1, 1)
                    });
                }

                if (!tables.TableNames.Contains("TaskMonk-Tasks"))
                {
                    await _dynamoDbClient.CreateTableAsync(new CreateTableRequest
                    {
                        TableName = "TaskMonk-Tasks",
                        AttributeDefinitions = new List<AttributeDefinition>
                        {
                            new AttributeDefinition("taskId", ScalarAttributeType.S)
                        },
                        KeySchema = new List<KeySchemaElement>
                        {
                            new KeySchemaElement("taskId", KeyType.HASH)
                        },
                        ProvisionedThroughput = new ProvisionedThroughput(1, 1)
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating test tables: {ex.Message}");
            }
        }

        [Fact]
        public async Task CompleteTaskWorkflow_Success()
        {
            // 1. Create a task
            var createTaskFunction = new CreateTask();
            var task = new TaskMonk.Models.Task
            {
                Title = "Test Task",
                Description = "Test Description",
                TeamId = _testTeamId,
                Priority = TaskPriority.High
            };

            var createTaskRequest = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(task),
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    Authorizer = new APIGatewayProxyRequest.AuthorizerContext
                    {
                        Claims = new Dictionary<string, string>
                        {
                            { "sub", _testUserId }
                        }
                    }
                }
            };

            var createTaskResponse = await createTaskFunction.FunctionHandler(createTaskRequest, _context);
            Assert.Equal(201, createTaskResponse.StatusCode);
            var createdTask = JsonSerializer.Deserialize<ApiResponse<TaskMonk.Models.Task>>(createTaskResponse.Body)?.Data;
            Assert.NotNull(createdTask);

            // 2. Update task status
            var updateTaskStatusFunction = new UpdateTaskStatus();
            var updateRequest = new APIGatewayProxyRequest
            {
                Body = JsonSerializer.Serialize(new UpdateTaskStatus.UpdateTaskStatusRequest
                {
                    TaskId = createdTask.TaskId,
                    Status = TaskStatus.InProgress
                }),
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    Authorizer = new APIGatewayProxyRequest.AuthorizerContext
                    {
                        Claims = new Dictionary<string, string>
                        {
                            { "sub", _testUserId }
                        }
                    }
                }
            };

            var updateResponse = await updateTaskStatusFunction.FunctionHandler(updateRequest, _context);
            Assert.Equal(200, updateResponse.StatusCode);

            // 3. Get team tasks
            var getTeamTasksFunction = new GetTeamTasks();
            var getTeamTasksRequest = new APIGatewayProxyRequest
            {
                PathParameters = new Dictionary<string, string>
                {
                    { "teamId", _testTeamId }
                },
                RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                {
                    Authorizer = new APIGatewayProxyRequest.AuthorizerContext
                    {
                        Claims = new Dictionary<string, string>
                        {
                            { "sub", _testUserId }
                        }
                    }
                }
            };

            var getTeamTasksResponse = await getTeamTasksFunction.FunctionHandler(getTeamTasksRequest, _context);
            Assert.Equal(200, getTeamTasksResponse.StatusCode);
            var teamTasks = JsonSerializer.Deserialize<ApiResponse<List<TaskMonk.Models.Task>>>(getTeamTasksResponse.Body)?.Data;
            Assert.NotNull(teamTasks);
            Assert.Contains(teamTasks, t => t.TaskId == createdTask.TaskId);
        }

        public void Dispose()
        {
            // Clean up test data
            CleanupTestData().Wait();
        }

        private async Task CleanupTestData()
        {
            try
            {
                // Delete test task
                await _dynamoDbService.DeleteItemAsync("TaskMonk-Tasks", "taskId", _testTaskId);
                
                // Delete test team
                await _dynamoDbService.DeleteItemAsync("TaskMonk-Teams", "teamId", _testTeamId);
                
                // Delete test user
                await _dynamoDbService.DeleteItemAsync("TaskMonk-Users", "userId", _testUserId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error cleaning up test data: {ex.Message}");
            }
        }
    }
}