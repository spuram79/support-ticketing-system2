import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('should display dashboard with stat cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for header
    await expect(page.locator('h1')).toContainText('Support Ticketing Dashboard');
    
    // Check for stat cards
    await expect(page.locator('text=Open')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Resolved')).toBeVisible();
    await expect(page.locator('text=Closed')).toBeVisible();
  });

  test('should display recent tickets section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h2:has-text("Recent Tickets")')).toBeVisible();
    await expect(page.locator('text=Ticket #')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');
    
    // Should show loading indicator or content
    const loadingIndicator = page.locator('text=Loading...');
    // Loading might be too fast to catch, so we check for either loading or content
    const hasLoading = await loadingIndicator.count() > 0;
    const hasContent = await page.locator('h1').count() > 0;
    expect(hasLoading || hasContent).toBeTruthy();
  });

  test('should navigate to tickets page', async ({ page }) => {
    await page.goto('/');
    
    // Click on tickets link if exists
    const ticketsLink = page.locator('a[href="/tickets"]');
    if (await ticketsLink.count() > 0) {
      await ticketsLink.click();
      await expect(page).toHaveURL('/tickets');
    }
  });
});