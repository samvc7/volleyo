import { test, expect } from "@playwright/test"

test("navigate to team statistics page", async ({ page }) => {
  await page.goto("/alpha-team/events")

  await page.getByRole("link", { name: "Statistics" }).click()
  await expect(page.getByText("Games Overview")).toBeVisible()
  await expect(page.getByText("Attack").first()).toBeVisible()
  await expect(page.getByText("Defence")).toBeVisible()
  await expect(page.getByText("Serve")).toBeVisible()

  await expect(page.getByText("Scores vs. Errors")).toBeVisible()
  await expect(page.getByText("Error Distribution", { exact: true })).toBeVisible()
  await expect(page.getByText("Attack").nth(2)).toBeVisible()
  await expect(page.getByText("Leaderboard")).toBeVisible()
})
