using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using System.Text.Json;
using TaskMonk.Models;

namespace TaskMonk.Services
{
    public class DynamoDbService
    {
        private readonly IAmazonDynamoDB _dynamoDb;
        
        public DynamoDbService()
        {
            _dynamoDb = new AmazonDynamoDBClient();
        }
        
        public DynamoDbService(IAmazonDynamoDB dynamoDb)
        {
            _dynamoDb = dynamoDb;
        }
        
        public async Task<T?> GetItemAsync<T>(string tableName, string keyName, string keyValue)
        {
            var request = new GetItemRequest
            {
                TableName = tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    { keyName, new AttributeValue { S = keyValue } }
                }
            };
            
            var response = await _dynamoDb.GetItemAsync(request);
            
            if (response.Item == null || response.Item.Count == 0)
            {
                return default;
            }
            
            var document = Document.FromAttributeMap(response.Item);
            return JsonSerializer.Deserialize<T>(document.ToJson());
        }
        
        public async Task<bool> PutItemAsync<T>(string tableName, T item)
        {
            var json = JsonSerializer.Serialize(item);
            var document = Document.FromJson(json);
            var attributeMap = document.ToAttributeMap();
            
            var request = new PutItemRequest
            {
                TableName = tableName,
                Item = attributeMap
            };
            
            await _dynamoDb.PutItemAsync(request);
            return true;
        }
        
        public async Task<bool> DeleteItemAsync(string tableName, string keyName, string keyValue)
        {
            var request = new DeleteItemRequest
            {
                TableName = tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    { keyName, new AttributeValue { S = keyValue } }
                }
            };
            
            await _dynamoDb.DeleteItemAsync(request);
            return true;
        }
        
        public async Task<List<T>> QueryAsync<T>(string tableName, string indexName, string keyName, string keyValue)
        {
            var request = new QueryRequest
            {
                TableName = tableName,
                IndexName = indexName,
                KeyConditionExpression = $"{keyName} = :v_key",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":v_key", new AttributeValue { S = keyValue } }
                }
            };
            
            var response = await _dynamoDb.QueryAsync(request);
            var items = new List<T>();
            
            foreach (var item in response.Items)
            {
                var document = Document.FromAttributeMap(item);
                var obj = JsonSerializer.Deserialize<T>(document.ToJson());
                if (obj != null)
                {
                    items.Add(obj);
                }
            }
            
            return items;
        }
        
        public async Task<bool> UpdateItemAsync(string tableName, string keyName, string keyValue, 
            Dictionary<string, AttributeValue> updates)
        {
            var key = new Dictionary<string, AttributeValue>
            {
                { keyName, new AttributeValue { S = keyValue } }
            };
            
            var updateExpressions = new List<string>();
            var expressionAttributeValues = new Dictionary<string, AttributeValue>();
            var expressionAttributeNames = new Dictionary<string, string>();
            
            int i = 0;
            foreach (var update in updates)
            {
                updateExpressions.Add($"#{i} = :{i}");
                expressionAttributeNames.Add($"#{i}", update.Key);
                expressionAttributeValues.Add($":{i}", update.Value);
                i++;
            }
            
            var request = new UpdateItemRequest
            {
                TableName = tableName,
                Key = key,
                UpdateExpression = "SET " + string.Join(", ", updateExpressions),
                ExpressionAttributeNames = expressionAttributeNames,
                ExpressionAttributeValues = expressionAttributeValues
            };
            
            await _dynamoDb.UpdateItemAsync(request);
            return true;
        }
    }
}