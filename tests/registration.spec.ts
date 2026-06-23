import { test, expect, Account } from '../utils/fixtures';
import { RegisterPage } from '../pages/RegisterPage';
import { uniqueEmail, strongPassword } from '../utils/helpers';
import users from './data/users.json';

/**
 * Feature: User Registration (/register)
 * Scenarios: Pass (valid sign-up, data-driven) | Fail (duplicate email) | Edge (invalid field values)
 */
test.describe('User Registration', () => {
  // ----- PASS: data-driven across multiple valid profiles -----
  for (const profile of users.validRegistrations) {
    test(`PASS: register a new ${profile.gender} customer (${profile.firstName})`, async ({ page }) => {
      const register = new RegisterPage(page);
      await register.open();

      await register.register({
        gender: profile.gender as 'male' | 'female',
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: uniqueEmail('register'),
        password: strongPassword(),
      });

      await expect(register.successResult).toContainText('Your registration completed');
      // After registering, the customer is authenticated.
      await expect(register.logoutLink).toBeVisible();
    });
  }

  // ----- FAIL: cannot register twice with the same email -----
  test('FAIL: registering with an already-used email is rejected', async ({ page, account }: { page: any; account: Account }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register({
      gender: 'male',
      firstName: 'Dupe',
      lastName: 'User',
      email: account.email, // already registered by the worker fixture
      password: strongPassword(),
    });

    await expect(register.errorSummary).toContainText('The specified email already exists');
  });

  // ----- EDGE: invalid field values trigger inline validation -----
  test('EDGE: invalid email, short password and mismatched confirm show field errors', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.fillForm({
      gender: 'male',
      firstName: 'Edge',
      lastName: 'Case',
      email: 'invalid-email-format',
      password: '123', // below the 6-char minimum
      confirmPassword: '999', // does not match
    });
    await register.submit();

    await expect(register.fieldError('Email')).toContainText('Please enter a valid email address');
    await expect(register.fieldError('Password')).toBeVisible();
    await expect(register.fieldError('ConfirmPassword')).toContainText(
      'The password and confirmation password do not match.',
    );
  });
});
