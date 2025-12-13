import { User, IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  async register(userData: Partial<IUser>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const user = new User({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: 'user'
    });
    await user.save();
    return user;
  }

  async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string } | null> {
    const user = await User.findOne({ email });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) return null;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    return { user: userWithoutPassword, token };
  }
}
