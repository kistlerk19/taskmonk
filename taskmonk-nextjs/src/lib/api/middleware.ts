import { NextApiRequest, NextApiResponse } from 'next';
import { Auth } from 'aws-amplify';

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function withAuth(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse<any>>): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // In a real application, you would verify the JWT token from the Authorization header
      // For this mock implementation, we'll just check if the Authorization header exists
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // In production, you would verify the token with Cognito
      // const token = authHeader.split(' ')[1];
      // Verify token with AWS Cognito
      
      await handler(req, res);
      return;
    } catch (error: any) {
      res.status(401).json({ message: error.message || 'Authentication failed' });
      return;
    }
  };
}