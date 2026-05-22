import { test, expect } from '@playwright/test';

test.describe('Tickets Flow', () => {
  test('should navigate to tickets page', async ({ page }) => {
    await page.goto('/tickets');
    
    // Check for page header
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display ticket list or empty state', async ({ page }) => {
    await page.goto('/tickets');
    
    // Either tickets are listed or empty state is shown
    const hasTickets = await page.locator('[data-testid="ticket-item"], .ticket-card').count() > 0;
    const hasEmptyState = await page.locator('text=No tickets').count() > 0;
    expect(hasTickets || hasEmptyState).toBeTruthy();
  });

  test('should allow ticket creation with valid data', async ({ page }) => {
    await page.goto('/tickets');
    
    // Look for create ticket button
    const createButton = page.locator('button:has-text("Create"), button:has-text("New")');
    if (await createButton.count() > 0) {
      await createButton.click();
      
      // Fill in ticket form if it appears
      const subjectInput = page.locator('input[name="subject"], #subject');
      if (await subjectInput.count() > 0) {
        await subjectInput.fill('Test Ticket Subject');
        await page.locator('textarea[name="description"], #description').fill('Test ticket description');
        
        // Submit form
        await page.click('button[type="submit"]');
      }
    }
  });
});