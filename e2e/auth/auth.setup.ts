import { test as setup, expect } from "@playwright/test"
import path from "path"

const authFile = path.join(__dirname, "./user.json")

setup("authenticate", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Login").first()).toBeVisible()
  await page.getByRole("textbox", { name: "Email or Username" }).fill(process.env.ADMIN_USERNAME ?? "")
  await page.getByRole("textbox", { name: "Password" }).fill(process.env.ADMIN_PW ?? "")
  await page.getByRole("button", { name: "Login" }).click()

  await page.waitForLoadState("networkidle")
  await expect(page.getByText("Teams")).toBeVisible({ timeout: 10000 })

  await page.context().storageState({ path: authFile })

  await page.getByRole("button", { name: "A" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()
  await expect(page.getByText("Login").first()).toBeVisible()
})
