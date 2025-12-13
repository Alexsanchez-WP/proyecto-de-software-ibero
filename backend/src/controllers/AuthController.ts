import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponseFactory } from '../utils/ApiResponseFactory';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json(ApiResponseFactory.success(user, 'User registered successfully'));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      if (result) {
        res.json(ApiResponseFactory.success(result, 'Login successful'));
      } else {
        res.status(401).json(ApiResponseFactory.error('Invalid credentials'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };
}
