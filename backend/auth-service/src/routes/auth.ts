import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { OAuth2Client } from 'google-auth-library';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import argon2 from 'argon2';
import { z } from 'zod';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  const { email, password, name } = result.data;

  try {
    // B. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Login Schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  const { email, password } = result.data;

  try {
    // A. Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.password) {
      // User registered via Google but is trying to login with password
      res.status(400).json({ error: 'Please log in with Google' });
      return;
    }
    // B. Verify the password
    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,               
      { expiresIn: '1h' }                     
    );

    // D. Return the token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authReq.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Google Login/Signup Schema
const googleLoginSchema = z.object({
  token: z.string(), // The ID Token from the Frontend
});

// 7. Google Auth Endpoint
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  // A. Validate Input
  const result = googleLoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  const { token } = result.data;

  try {
    // B. Verify the Google Token
    // This contacts Google (or checks cache) to ensure the token is real and meant for OUR app.
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google Token payload' });
      return;
    }

    const { email, name, sub, picture, email_verified } = payload;

    // C. Check if user exists in OUR DB
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // D. If not, create them (Auto-Signup)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          password: null, // No password for Google users
          googleId: sub,
          provider: 'google',
          avatar: picture,
          isEmailVerified: email_verified === true,
        },
      });
    } else {
      // If user exists but doesn't have googleId linked, link it now
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: sub,
            avatar: user.avatar || picture,
            isEmailVerified: user.isEmailVerified || (email_verified === true),
          },
        });
      }
    }

    // E. Issue OUR Internal JWT (The "Kumo Badge")
    // Now the rest of the system treats them exactly like a normal user.
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

export default router;