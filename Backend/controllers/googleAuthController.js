const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

/**
 * Generate Google OAuth URL for frontend to redirect to
 */
async function getGoogleAuthUrl(req, res) {
  try {
    const scopes = ['profile', 'email'];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (err) {
    console.error('getGoogleAuthUrl error:', err);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}

/**
 * Handle Google OAuth callback
 * Frontend sends the authorization code, we exchange it for tokens
 */
async function handleGoogleCallback(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify and decode the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    console.log(`[Google Auth] User: ${email}, GoogleID: ${googleId}`);

    // Check if user exists
    let user = await User.findByEmail(email);

    if (user) {
      // ── Existing user: Log them in ──
      console.log(`[Google Auth] Existing user logging in: ${email}`);
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, department_id: user.department_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department_id: user.department_id || null
        },
        isNewUser: false
      });
    } else {
      // ── New user: Create account ──
      console.log(`[Google Auth] Creating new user: ${email}`);

      // Hash a random password (user won't use it with Google OAuth)
      const crypto = require('crypto');
      const randomPassword = await require('bcrypt').hash(
        crypto.randomBytes(32).toString('hex'),
        10
      );

      user = await User.createUser({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        role: 'CLIENT', // Default role for Google sign-ups
        status: 'active'
      });

      console.log(`[Google Auth] New user created: ${email}`);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, department_id: user.department_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Account created and logged in successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department_id: user.department_id || null
        },
        isNewUser: true
      });
    }
  } catch (err) {
    console.error('[Google Auth] Error:', err.message);
    res.status(401).json({ error: 'Failed to authenticate with Google' });
  }
}

module.exports = {
  getGoogleAuthUrl,
  handleGoogleCallback
};
