import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';
import { asyncHandler, validateRequest } from '../middleware/errorHandler.js';

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
authRouter.get('/check-admin', asyncHandler(async (req: Request, res: Response) => {
  let email = req.headers['x-user-email'] as string;

  console.log('[Auth Controller] Checking admin status for email:', email);

  validateRequest(email, 'Missing user email in header', 400);

  // Trim and lowercase email for comparison
  email = email.trim().toLowerCase();
  console.log('[Auth Controller] Normalized email:', email);

  const client = await pool.connect();

  try {
    // Use LOWER() for case-insensitive comparison
    const query = 'SELECT id FROM admin_users WHERE LOWER(admin_email) = $1';
    console.log('[Auth Controller] Running query with normalized email:', email);
    const result = await client.query(query, [email]);

    console.log('[Auth Controller] Query result rows:', result.rows);
    const isAdmin = result.rows.length > 0;
    console.log('[Auth Controller] Is admin:', isAdmin);

    res.status(200).json({
      isAdmin,
      email,
    });
  } finally {
    client.release();
  }
}));

export default authRouter;
