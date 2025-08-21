import { test, expect } from "@playwright/test"

test("navigate to members page", async ({ page }) => {
  await page.goto("/alpha-team/events")
  await page.getByRole("link", { name: "Members" }).click()

  await expect(page.getByRole("cell", { name: "Name" })).toBeVisible()
  await expect(page.getByRole("cell", { name: "Email" })).toBeVisible()
})

test("create, edit, remove team member", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Because of race condition testing parallel browsers we just test for chromium",
  )

  await page.goto("/alpha-team/members")

  // Add member
  await page.getByRole("button", { name: "Add Member" }).click()
  await expect(page.getByRole("heading", { name: "Add Team Member" })).toBeVisible()
  await page.getByRole("textbox", { name: "First Name" }).fill("John")
  await page.getByRole("textbox", { name: "Last Name" }).fill("Doe")
  await page.getByRole("textbox", { name: "Email" }).fill("john.doe@example.com")
  await page.getByRole("button", { name: "Create" }).click()
  await page.getByRole("textbox", { name: "Filter names" }).fill("John")
  await expect(page.getByRole("cell", { name: "John Doe" })).toBeVisible()

  // Edit member
  await page.getByRole("row", { name: "John Doe" }).getByRole("button").click()
  await page.getByRole("menuitem", { name: "Edit" }).click()
  await expect(page.getByRole("heading", { name: "Edit Team Member" })).toBeVisible()
  await page.getByRole("textbox", { name: "Nick Name" }).fill("Junny")
  await page.getByRole("button", { name: "Save" }).click()
  await page.getByRole("textbox", { name: "Filter names" }).fill("Junny")
  await expect(page.getByRole("cell", { name: "Junny" })).toBeVisible()

  // Remove member
  await page.getByRole("row", { name: "Junny" }).getByRole("button").click()
  await page.getByRole("menuitem", { name: "Remove" }).click()
  await expect(page.getByRole("heading", { name: "Removing Team Member" })).toBeVisible()
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByRole("cell", { name: "No Results" })).toBeVisible()
})

test("authorization admin", async ({ page }) => {
  await page.goto("/alpha-team/members")
  await expect(page.getByRole("button", { name: "Add Member" })).toBeVisible()
  await expect(page.getByRole("cell", { name: "Email" })).toBeVisible()
  const rowActionsCount = await page.getByRole("button", { name: "Open Menu" }).count()
  expect(rowActionsCount).toBeGreaterThan(0)
})

test.describe("authorization guest", () => {
  test.use({ storageState: "./e2e/auth/guest.json" })

  test("does not see members tab", async ({ page }) => {
    await page.goto("/alpha-team/events")
    await expect(page.getByRole("link", { name: "Events" })).toBeVisible()
    const membersTab = page.getByRole("link", { name: "Members" })
    await expect(membersTab).toHaveCount(0)
  })

  test("cannot navigate to members page", async ({ page }) => {
    await page.goto("/alpha-team/members")
    await expect(page.getByText("Forbidden")).toBeVisible()
  })
})
