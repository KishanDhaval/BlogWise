import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 * @param {Object} payload - The payload to encode
 * @returns {String} - JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET || 'access_token_secret',
    { expiresIn: '15m' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - The payload to encode
 * @returns {String} - JWT token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret',
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key to verify with
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};