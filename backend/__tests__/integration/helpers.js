// backend/__tests__/integration/helpers.js
import request from "supertest";

export const TEST_USER = {
  firstname: "Test",
  lastname: "User",
  email: "test@example.com",
  password: "MyT3stP@ssw0rd2025!#",
  confirmPassword: "MyT3stP@ssw0rd2025!#",
  terms: true,
};

export const TEST_USER_2 = {
  firstname: "Second",
  lastname: "User",
  email: "test2@example.com",
  password: "MyS3condP@ssw0rd2025!#",
  confirmPassword: "MyS3condP@ssw0rd2025!#",
  terms: true,
};

export async function registerUser(app, overrides = {}) {
  const userData = { ...TEST_USER, ...overrides };
  return request(app)
    .post("/api/v1/auth/register")
    .send(userData);
}

/**
 * Register and verify email.
 * Caller must pass the email service mock object.
 */
export async function registerAndVerify(app, emailServiceMock, overrides = {}) {
  await request(app)
    .post("/api/v1/auth/register")
    .send({ ...TEST_USER, ...overrides });

  // emailServiceMock is the mockEmailInstance object
  const verificationToken = emailServiceMock.sendVerificationEmail.mock.calls[0][1];

  return request(app)
    .post("/api/v1/auth/verify-email")
    .send({ token: verificationToken });
}

/**
 * Register, verify, and login using an agent for cookie persistence.
 * Returns accessToken, user object with password, and agent for cookie-based tests.
 * Handles 2FA-enabled users by returning accessToken: undefined and requires2FA: true.
 */
export async function registerVerifyAndLogin(app, emailServiceMock, overrides = {}) {
  const agent = request.agent(app);
  const userData = { ...TEST_USER, ...overrides };

  // Register user
  const registerRes = await agent
    .post("/api/v1/auth/register")
    .send(userData);

  // Extract raw verification token from email mock
  // (NOT from DB — the stored token is SHA256 hashed)
  if (emailServiceMock.sendVerificationEmail.mock.calls.length === 0) {
    throw new Error("sendVerificationEmail was not called - mock calls array is empty");
  }
  // Use the last call to handle multiple registrations in the same test
  const lastCallIndex = emailServiceMock.sendVerificationEmail.mock.calls.length - 1;
  const verificationToken =
    emailServiceMock.sendVerificationEmail.mock.calls[lastCallIndex][1];

  // Verify email
  await agent
    .post("/api/v1/auth/verify-email")
    .send({ token: verificationToken });

  // Login
  const loginRes = await agent
    .post("/api/v1/auth/login")
    .send({
      email: userData.email,
      password: userData.password,
    });

  // Handle 2FA-enabled users
  if (loginRes.body.data?.requiresTwoFactor) {
    return {
      agent,
      loginRes,
      accessToken: undefined,
      requires2FA: true,
      tempToken: loginRes.body.data.tempToken,
      user: { ...userData },
    };
  }

  return {
    agent,
    loginRes,
    accessToken: loginRes.body.data.accessToken,
    requires2FA: false,
    user: {
      ...userData,
      id: loginRes.body.data.user?._id || loginRes.body.data.user?.id,
      password: userData.password,
    },
  };
}

