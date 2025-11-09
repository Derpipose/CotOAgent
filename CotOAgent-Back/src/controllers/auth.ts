import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';

const authRouter: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

/**
 * Check if a user is an admin
 * GET /auth/check-admin
 * Requires Authorization header with email
 */
authRouter.get('/check-admin', async (req: Request, res: Response) => {
  try {
    let email = req.headers['x-user-email'] as string;

    console.log('[Auth Controller] Checking admin status for email:', email)

    if (!email) {
      console.log('[Auth Controller] No email provided in header')
      return res.status(400).json({ 
        error: 'Missing user email in header',
        isAdmin: false 
      });
    }

    // Trim and lowercase email for comparison
    email = email.trim().toLowerCase();
    console.log('[Auth Controller] Normalized email:', email)

    const client = await pool.connect();
    
    try {
      // Use LOWER() for case-insensitive comparison
      const query = 'SELECT id FROM admin_users WHERE LOWER(admin_email) = $1';
      console.log('[Auth Controller] Running query with normalized email:', email)
      const result = await client.query(query, [email]);

      console.log('[Auth Controller] Query result rows:', result.rows)
      const isAdmin = result.rows.length > 0;
      console.log('[Auth Controller] Is admin:', isAdmin)

      return res.status(200).json({ 
        isAdmin,
        email
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Auth Controller] Error checking admin status:', error);
    return res.status(500).json({ 
      error: 'Failed to check admin status',
      isAdmin: false 
    });
  }
});

export default authRouter;
