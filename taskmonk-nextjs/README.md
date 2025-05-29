# TaskMonk - Task Management Application

TaskMonk is a modern task management application built with Next.js, TypeScript, and Tailwind CSS. It integrates with AWS Cognito for authentication and provides a comprehensive set of features for managing tasks and teams.

## Features

- User authentication with AWS Cognito
- Dashboard with task and team overview
- Task management (create, view, edit, delete)
- Team management (create, view, invite members)
- Reports and data visualization
- User profile management
- Responsive design for all devices

## Tech Stack

- **Frontend Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: AWS Cognito via AWS Amplify
- **Data Fetching**: React Query
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskmonk.git
   cd taskmonk/taskmonk-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your AWS Cognito configuration:
   ```
   NEXT_PUBLIC_AWS_REGION=your-region
   NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
   NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-client-id
   NEXT_PUBLIC_API_URL=your-api-url
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
taskmonk-nextjs/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── layout/     # Layout components
│   │   ├── tasks/      # Task-related components
│   │   ├── teams/      # Team-related components
│   │   └── ui/         # Reusable UI components
│   ├── lib/
│   │   ├── api/        # API client and utilities
│   │   └── auth/       # Authentication utilities
│   ├── pages/          # Next.js pages
│   │   ├── api/        # API routes
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # Dashboard page
│   │   ├── tasks/      # Task pages
│   │   ├── teams/      # Team pages
│   │   ├── reports/    # Reports page
│   │   └── profile/    # User profile page
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── .env.local          # Environment variables
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Deployment

The application can be deployed to various platforms:

### Vercel (Recommended)

```bash
npm run build
# or
yarn build
```

Then deploy using the Vercel CLI or connect your GitHub repository to Vercel for automatic deployments.

### AWS Amplify

You can also deploy the application using AWS Amplify for seamless integration with your AWS services.

## License

This project is licensed under the MIT License - see the LICENSE file for details.