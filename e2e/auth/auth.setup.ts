import { test as setup, expect } from "@playwright/test"
import path from "path"
import dotenv from "dotenv"

const authFile = path.join(__dirname, "./user.json")
const authGuestFile = path.join(__dirname, "./guest.json")
dotenv.config({ path: ".env.local" })

setup("authenticate", async ({ page, context }) => {
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

setup("authenticate guest", async ({ page }) => {
  const guestUsername = process.env.GUEST_USERNAME
  const guestPw = process.env.GUEST_PW

  if (!guestUsername || !guestPw) {
    throw new Error("GUEST_USERNAME and GUEST_PW must be set in environment variables")
  }

  await page.goto("/")
  await expect(page.getByText("Login").first()).toBeVisible()
  await page.getByRole("textbox", { name: "Email or Username" }).fill(guestUsername)
  await page.getByRole("textbox", { name: "Password" }).fill(guestPw)
  await page.getByRole("button", { name: "Login" }).click()

  await page.waitForLoadState("networkidle")
  await expect(page.getByText("Teams")).toBeVisible()

  await page.context().storageState({ path: authGuestFile })

  await page.getByRole("button", { name: "G" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()
  await expect(page.getByText("Login").first()).toBeVisible()
})
