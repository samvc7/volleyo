import { test, expect } from "@playwright/test"

test.only("navigate to members page", async ({ page }) => {
  await page.goto("/alpha-squad/events")
  await page.getByRole("link", { name: "Members" }).click()

  await expect(page.getByRole("button", { name: "Create Team Member" })).toBeVisible()
  await expect(page.getByRole("cell", { name: "Name" })).toBeVisible()
  await expect(page.getByRole("cell", { name: "Email" })).toBeVisible()
})
