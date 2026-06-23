import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { uniqueEmail } from '../utils/helpers';

/**
 * Feature: Contact Us (/contactus)
 * Scenarios:
 *   Pass  - a complete, valid enquiry is sent
 *   Fail  - an invalid email is rejected
 *   Edge  - a very long enquiry body (boundary) is accepted
 */
test.describe('Contact Us', () => {
  // ----- PASS: valid enquiry is submitted -----
  test('PASS: send a valid enquiry', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    await contact.send('Jane Doe', uniqueEmail('contact'), 'Hello, I have a question about my order.');

    await expect(contact.result).toBeVisible();
    expect(await contact.resultText()).toContain('Your enquiry has been successfully sent');
  });

  // ----- FAIL: invalid email is rejected -----
  test('FAIL: invalid email shows a validation error', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    await contact.send('Jane Doe', 'invalid-email', 'This should fail email validation.');

    await expect(contact.fieldError('Email')).toContainText('Please enter a valid email address');
  });

  // ----- EDGE: long enquiry body (boundary) is accepted -----
  test('EDGE: a very long enquiry body is accepted', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    const longBody = 'Lorem ipsum dolor sit amet. '.repeat(120); // ~3,300 chars
    await contact.send('Long Message', uniqueEmail('contact.long'), longBody);

    await expect(contact.result).toBeVisible();
    expect(await contact.resultText()).toContain('Your enquiry has been successfully sent');
  });
});
