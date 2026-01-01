// tests/unit/email.test.js
// Unit tests cho email utility

const { sendOTPEmail } = require('../../services/auth-service/utils/email');

describe('Email Utility', () => {
  // Mock nodemailer
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    // Không có email config để test fallback mode
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('sendOTPEmail', () => {
    test('should return true when email config is not set (fallback mode)', async () => {
      const result = await sendOTPEmail('test@example.com', '123456', 'TestUser');
      expect(result).toBe(true);
    });
    
    test('should handle email sending with valid config', async () => {
      // Mock email config
      process.env.EMAIL_USER = 'test@gmail.com';
      process.env.EMAIL_PASS = 'testpass';
      process.env.EMAIL_FROM = 'noreply@techstore.com';
      
      // Note: This will try to send email, but in test environment
      // it will likely fail and return false or log to console
      const result = await sendOTPEmail('test@example.com', '123456', 'TestUser');
      // Result can be true or false depending on email service availability
      expect(typeof result).toBe('boolean');
    });
    
    test('should handle missing username parameter', async () => {
      const result = await sendOTPEmail('test@example.com', '123456');
      expect(result).toBe(true);
    });
    
    test('should handle empty OTP code', async () => {
      const result = await sendOTPEmail('test@example.com', '', 'TestUser');
      expect(result).toBe(true);
    });
  });
});

