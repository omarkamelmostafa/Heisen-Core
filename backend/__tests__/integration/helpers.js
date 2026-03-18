import request from "supertest";

export const TEST_USER = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  password: "SecurePassword123!",
  confirmPassword: "SecurePassword123!",
};

export const TEST_USER_2 = {
  firstName: "Second",
  lastName: "User",
  email: "test2@example.com",
  password: "SecurePassword123!",
  confirmPassword: "SecurePassword123!",
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
 */
export async function registerVerifyAndLogin(app, emailServiceMock, overrides = {}) {
  const agent = request.agent(app);
  const userData = { ...TEST_USER, ...overrides };
  
  await agent
    .post("/api/v1/auth/register")
    .send(userData);
  
  // Extract token from the mock
  const verificationToken = emailServiceMock.sendVerificationEmail.mock.calls[0][1];
  
  await agent
    .post("/api/v1/auth/verify-email")
    .send({ token: verificationToken });
  
  const loginRes = await agent
    .post("/api/v1/auth/login")
    .send({
      email: userData.email,
      password: userData.password,
    });
  
  return { agent, loginRes };
}

