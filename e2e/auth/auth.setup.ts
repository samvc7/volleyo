import { test as setup, expect } from "@playwright/test"
import path from "path"
import dotenv from "dotenv"

const authFile = path.join(__dirname, "./user.json")
dotenv.config({ path: ".env.local" })

setup("authenticate", async ({ page }) => {
  const username = process.env.ADMIN_USERNAME
  const pw = process.env.ADMIN_PW

  if (!username || !pw) {
    throw new Error("ADMIN_USERNAME and ADMIN_PW must be set in environment variables")
  }

  await page.goto("/")
  await expect(page.getByText("Login").first()).toBeVisible()
  await page.getByRole("textbox", { name: "Email or Username" }).fill(username)
  await page.getByRole("textbox", { name: "Password" }).fill(pw)
  await page.getByRole("button", { name: "Login" }).click()

  await page.waitForLoadState("networkidle")
  await expect(page.getByText("Teams")).toBeVisible()

  await page.context().storageState({ path: authFile })

  await page.getByRole("button", { name: "A" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()
  await expect(page.getByText("Login").first()).toBeVisible()
})
