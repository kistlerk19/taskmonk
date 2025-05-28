# TaskMonk - AWS Serverless Task Management System

A serverless task management system built with AWS services.

## Architecture

- **AWS Lambda (.NET 8)**: Serverless compute for business logic
- **Amazon DynamoDB**: NoSQL database for storing tasks, teams, users, and comments
- **Amazon Cognito**: User authentication and authorization
- **Amazon API Gateway**: RESTful API endpoints
- **Amazon SES**: Email notifications
- **Amazon EventBridge**: Event-driven notifications
- **AWS CloudFormation/SAM**: Infrastructure as Code

## Project Structure

- `/src`: Contains all Lambda function code
  - `/Functions`: Individual Lambda functions
  - `/Models`: Shared data models
  - `/Services`: Shared services
  - `/Utils`: Utility classes
- `/template.yaml`: AWS SAM template for infrastructure
- `/tests`: Unit and integration tests

## Deployment

1. Install AWS SAM CLI
2. Run `sam build`
3. Run `sam deploy --guided`