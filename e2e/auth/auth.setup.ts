import { test as setup, expect } from "@playwright/test"
import path from "path"

const authFile = path.join(__dirname, "./user.json")

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("/")
  await expect(page.getByText("Login").first()).toBeVisible()
  await page.getByRole("textbox", { name: "Email or Username" }).fill("admin@example.com")
  await page.getByRole("textbox", { name: "Password" }).fill("admin123")
  await page.getByRole("button", { name: "Login" }).click()
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("/")
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByText("Select Team")).toBeVisible()

  // End of authentication steps.
  await page.context().storageState({ path: authFile })

  await page.getByRole("button", { name: "A" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()
  await expect(page.getByText("Login").first()).toBeVisible()
})
