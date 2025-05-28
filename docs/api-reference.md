# TaskMonk API Reference

## Overview

TaskMonk provides a RESTful API for interacting with the task management system. All API endpoints are secured with Amazon Cognito authentication except for the user creation endpoint.

## Base URL

```
https://api.taskmonk.com/{environment}
```

Replace `{environment}` with `dev`, `test`, or `prod` depending on the deployment environment.

## Authentication

All API requests (except user creation) require authentication using a JWT token from Amazon Cognito.

Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Users

### Create User

Creates a new user in the system.

**Endpoint:** `POST /users`

**Authentication:** None (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "teams": [],
    "createdAt": "2023-06-15T14:30:00Z",
    "updatedAt": "2023-06-15T14:30:00Z"
  }
}
```

## Teams

### Create Team

Creates a new team.

**Endpoint:** `POST /teams`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Engineering Team",
  "description": "Team responsible for product development"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Engineering Team",
    "description": "Team responsible for product development",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "members": ["550e8400-e29b-41d4-a716-446655440000"],
    "createdAt": "2023-06-15T14:35:00Z",
    "updatedAt": "2023-06-15T14:35:00Z"
  }
}
```

### Invite to Team

Invites a user to join a team.

**Endpoint:** `POST /teams/invite`

**Authentication:** Required

**Request Body:**
```json
{
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "newuser@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": null
}
```

## Tasks

### Create Task

Creates a new task.

**Endpoint:** `POST /tasks`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Implement API documentation",
  "description": "Create comprehensive API documentation for the TaskMonk system",
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "priority": "High",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
  "deadline": "2023-07-15T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "taskId": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Implement API documentation",
    "description": "Create comprehensive API documentation for the TaskMonk system",
    "status": "Todo",
    "priority": "High",
    "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "deadline": "2023-07-15T00:00:00Z",
    "createdAt": "2023-06-15T14:40:00Z",
    "updatedAt": "2023-06-15T14:40:00Z"
  }
}
```

### Update Task Status

Updates the status of a task.

**Endpoint:** `PUT /tasks/status`

**Authentication:** Required

**Request Body:**
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "InProgress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "taskId": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Implement API documentation",
    "description": "Create comprehensive API documentation for the TaskMonk system",
    "status": "InProgress",
    "priority": "High",
    "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "deadline": "2023-07-15T00:00:00Z",
    "createdAt": "2023-06-15T14:40:00Z",
    "updatedAt": "2023-06-15T14:45:00Z"
  }
}
```

### Get User Tasks

Retrieves tasks assigned to the current user.

**Endpoint:** `GET /tasks/my`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "taskId": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Implement API documentation",
      "description": "Create comprehensive API documentation for the TaskMonk system",
      "status": "InProgress",
      "priority": "High",
      "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
      "teamId": "550e8400-e29b-41d4-a716-446655440001",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": "2023-07-15T00:00:00Z",
      "createdAt": "2023-06-15T14:40:00Z",
      "updatedAt": "2023-06-15T14:45:00Z"
    }
  ]
}
```

### Get Team Tasks

Retrieves tasks for a specific team.

**Endpoint:** `GET /teams/{teamId}/tasks`

**Authentication:** Required

**Path Parameters:**
- `teamId`: ID of the team

**Response:**
```json
{
  "success": true,
  "message": "Team tasks retrieved successfully",
  "data": [
    {
      "taskId": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Implement API documentation",
      "description": "Create comprehensive API documentation for the TaskMonk system",
      "status": "InProgress",
      "priority": "High",
      "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
      "teamId": "550e8400-e29b-41d4-a716-446655440001",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": "2023-07-15T00:00:00Z",
      "createdAt": "2023-06-15T14:40:00Z",
      "updatedAt": "2023-06-15T14:45:00Z"
    }
  ]
}
```

### Filter Tasks

Filters tasks based on various criteria.

**Endpoint:** `POST /tasks/filter`

**Authentication:** Required

**Request Body:**
```json
{
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "status": "InProgress",
  "priority": "High",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2023-06-01T00:00:00Z",
  "endDate": "2023-06-30T23:59:59Z",
  "searchTerm": "documentation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks filtered successfully",
  "data": [
    {
      "taskId": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Implement API documentation",
      "description": "Create comprehensive API documentation for the TaskMonk system",
      "status": "InProgress",
      "priority": "High",
      "assignedTo": "550e8400-e29b-41d4-a716-446655440000",
      "teamId": "550e8400-e29b-41d4-a716-446655440001",
      "createdBy": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": "2023-07-15T00:00:00Z",
      "createdAt": "2023-06-15T14:40:00Z",
      "updatedAt": "2023-06-15T14:45:00Z"
    }
  ]
}
```

## Comments

### Get Comments

Retrieves comments for a specific task.

**Endpoint:** `GET /tasks/{taskId}/comments`

**Authentication:** Required

**Path Parameters:**
- `taskId`: ID of the task

**Response:**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "commentId": "550e8400-e29b-41d4-a716-446655440003",
      "taskId": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Started working on this task",
      "createdAt": "2023-06-15T14:50:00Z",
      "updatedAt": "2023-06-15T14:50:00Z"
    }
  ]
}
```

## Reports

### Generate Task Report

Generates a report based on tasks.

**Endpoint:** `POST /reports/tasks`

**Authentication:** Required

**Request Body:**
```json
{
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "startDate": "2023-06-01T00:00:00Z",
  "endDate": "2023-06-30T23:59:59Z",
  "reportType": "summary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "totalTasks": 10,
    "completedTasks": 5,
    "completionRate": 50.0,
    "averageCompletionTime": 3.5,
    "tasksByStatus": {
      "Todo": 2,
      "InProgress": 3,
      "Review": 0,
      "Done": 5
    },
    "tasksByPriority": {
      "Low": 2,
      "Medium": 3,
      "High": 4,
      "Critical": 1
    },
    "tasksByDay": {
      "2023-06-15": {
        "created": 3,
        "completed": 1
      },
      "2023-06-16": {
        "created": 2,
        "completed": 2
      }
    }
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "data": null
}
```

Common HTTP status codes:

- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server-side error

## Rate Limiting

API requests are limited to 100 requests per minute per user. Exceeding this limit will result in a `429 Too Many Requests` response.