#!/bin/bash
set -e

# Create a deployment bucket if it doesn't exist
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="taskmonk-deployment-$ACCOUNT_ID"
REGION=$(aws configure get region)
SENDER_EMAIL=${1:-"noreply@example.com"}
ENVIRONMENT=${2:-"dev"}

echo "Creating deployment bucket if it doesn't exist..."
aws s3 mb s3://$BUCKET_NAME --region $REGION || true

echo "Packaging the application..."
aws cloudformation package \
  --template-file template.yaml \
  --s3-bucket $BUCKET_NAME \
  --output-template-file packaged.yaml

echo "Deploying the application..."
aws cloudformation deploy \
  --template-file packaged.yaml \
  --stack-name taskmonk-$ENVIRONMENT \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT SenderEmail=$SENDER_EMAIL

echo "Deployment complete!"
echo "Getting outputs..."
aws cloudformation describe-stacks \
  --stack-name taskmonk-$ENVIRONMENT \
  --query "Stacks[0].Outputs" \
  --output table