# TaskMonk Administrator Guide

## System Overview

TaskMonk is a serverless task management system built on AWS. This guide provides information for administrators to deploy, configure, and maintain the system.

## Architecture

TaskMonk uses the following AWS services:

- **AWS Lambda**: Serverless compute for business logic
- **Amazon DynamoDB**: NoSQL database for storing tasks, teams, users, and comments
- **Amazon Cognito**: User authentication and authorization
- **Amazon API Gateway**: RESTful API endpoints
- **Amazon SES**: Email notifications
- **Amazon EventBridge**: Event-driven notifications
- **AWS CloudFormation/SAM**: Infrastructure as Code
- **Amazon S3**: Frontend hosting
- **Amazon CloudFront**: Content delivery network

## Deployment

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- AWS SAM CLI installed
- Node.js 18+ for frontend development
- .NET 8 SDK for backend development

### Initial Deployment

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/taskmonk.git
   cd taskmonk
   ```

2. Deploy the backend:
   ```
   sam build
   sam deploy --guided
   ```
   
   During the guided deployment, you'll need to provide:
   - Stack name (e.g., taskmonk-dev)
   - AWS Region
   - Environment parameter (dev, test, or prod)
   - Sender email for notifications

3. Build and deploy the frontend:
   ```
   cd frontend
   npm install
   npm run build
   aws s3 sync build/ s3://your-frontend-bucket-name --delete
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

### CI/CD Pipeline

TaskMonk includes a GitHub Actions workflow for continuous integration and deployment:

1. Configure GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `SENDER_EMAIL`
   - `FRONTEND_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`

2. Push changes to the main branch to trigger automatic deployment

## Configuration

### Environment Variables

The following environment variables can be configured:

- `ENVIRONMENT`: Deployment environment (dev, test, prod)
- `SENDER_EMAIL`: Email address used for sending notifications
- `USERS_TABLE`: DynamoDB table name for users
- `TEAMS_TABLE`: DynamoDB table name for teams
- `TASKS_TABLE`: DynamoDB table name for tasks
- `COMMENTS_TABLE`: DynamoDB table name for comments

### Amazon SES Configuration

1. Verify the sender email address in Amazon SES
2. If in sandbox mode, verify recipient email addresses
3. To move out of sandbox mode, submit a request to AWS Support

### Amazon Cognito Configuration

1. Navigate to the Cognito console
2. Find the TaskMonk user pool
3. Configure password policies, MFA settings, and other security features as needed

## Monitoring and Logging

### CloudWatch Logs

All Lambda functions log to CloudWatch Logs. Log groups are named according to the function names.

To view logs:
1. Navigate to CloudWatch console
2. Select "Log groups"
3. Find the log group for the function you want to monitor

### CloudWatch Metrics

Monitor the following metrics:
- Lambda function invocations and errors
- API Gateway requests and latency
- DynamoDB read/write capacity units

### Alarms

Set up CloudWatch Alarms for:
- Lambda function errors exceeding threshold
- API Gateway 5xx errors
- DynamoDB throttling events

## Backup and Recovery

### DynamoDB Backups

1. Enable point-in-time recovery for all DynamoDB tables:
   ```
   aws dynamodb update-continuous-backups \
     --table-name TaskMonk-Users-dev \
     --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
   ```

2. Create on-demand backups periodically:
   ```
   aws dynamodb create-backup \
     --table-name TaskMonk-Users-dev \
     --backup-name TaskMonk-Users-dev-backup-$(date +%Y%m%d)
   ```

### Frontend Backup

The frontend is stored in S3 and can be backed up using:
```
aws s3 sync s3://your-frontend-bucket-name backup-directory/
```

## Scaling

TaskMonk is built on serverless architecture that scales automatically:

- **Lambda**: Automatically scales based on demand
- **DynamoDB**: Uses on-demand capacity by default
- **API Gateway**: Automatically scales to handle traffic

For high-traffic scenarios, consider:
- Implementing caching at the API Gateway level
- Optimizing DynamoDB access patterns
- Setting appropriate Lambda concurrency limits

## Security

### IAM Permissions

The SAM template creates IAM roles with least-privilege permissions for each Lambda function.

### Data Encryption

- DynamoDB tables use AWS-managed encryption at rest
- API Gateway uses HTTPS for all communications
- S3 buckets use server-side encryption

### Authentication

- User authentication is handled by Amazon Cognito
- API endpoints are protected by Cognito authorizers
- JWT tokens are used for API authentication

## Troubleshooting

### Common Issues

1. **Deployment Failures**:
   - Check CloudFormation events for detailed error messages
   - Verify IAM permissions
   - Check for resource name conflicts

2. **Email Notifications Not Sending**:
   - Verify SES configuration
   - Check if email addresses are verified (if in sandbox mode)
   - Check CloudWatch Logs for the EmailNotificationHandler function

3. **API Errors**:
   - Check API Gateway logs
   - Verify Cognito configuration
   - Check Lambda function logs

### Support

For additional support:
1. Check the GitHub repository issues
2. Contact the development team
3. Refer to AWS documentation for service-specific issues