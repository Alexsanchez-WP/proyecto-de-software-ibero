import { AuthService } from '../../../src/services/AuthService';
import { User } from '../../../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../src/models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const mockUserData = { username: 'test', email: 'test@test.com', password: 'password' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      const mockSave = jest.fn().mockResolvedValue({ ...mockUserData, password: 'hashed_password', role: 'user' });
      (User as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave
      }));

      await authService.register(mockUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User).toHaveBeenCalledWith({
        username: 'test',
        email: 'test@test.com',
        password: 'hashed_password',
        role: 'user'
      });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token and user if credentials are valid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@test.com',
        password: 'hashed_password',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@test.com',
          password: 'hashed_password',
          role: 'user'
        })
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake_token');

      const result = await authService.login('test@test.com', 'password');

      expect(result).toEqual({
        user: { _id: 'user123', email: 'test@test.com', role: 'user' },
        token: 'fake_token'
      });
    });

    it('should return null if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.login('test@test.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser = {
        email: 'test@test.com',
        password: 'hashed_password'
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.login('test@test.com', 'wrong_password');

      expect(result).toBeNull();
    });
  });
});
