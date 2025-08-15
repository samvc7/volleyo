import { test, expect } from "@playwright/test"

test("navigate to team events page", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("combobox", { name: "Select Team" }).click()
  await page.getByRole("option", { name: "Alpha Squad" }).click()

  await expect(page.getByText("Alpha Squad")).toBeVisible()
  await expect(page.getByText("Past Events")).toBeVisible()
  await expect(page.getByText("Game")).toHaveCount(5)
  await expect(page.getByRole("link", { name: "Events" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Statistics" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Members" })).toBeVisible()
})

test("create", async ({ page }) => {
  await page.goto("/alpha-squad/events")

  await page.getByRole("button", { name: "Add Event" }).click()

  await expect(page.getByRole("heading", { name: "Add Event" })).toBeVisible()
  await page.getByRole("combobox", { name: "" }).click()
  await page.getByRole("option", { name: "MATCH" }).click()

  await page.getByRole("textbox", { name: "Title" }).fill("E2E Test")
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("This is a test event created by Playwright E2E tests.")

  await page.getByRole("textbox", { name: "Date" }).click()
  await page.getByRole("button", { name: "today" }).click()

  await page.getByRole("textbox", { name: "Time" }).fill("10:00")
  await page.getByRole("textbox", { name: "Location" }).fill("Test Location")

  await page.getByRole("button", { name: "Save" }).click()

  await expect(page.getByText("E2E Test")).toBeVisible()
})

test("edit event", async ({ page }) => {
  await page.goto("/event/game-5")
  await page.getByRole("button", { name: "Edit Event" }).click()
  await page.getByRole("textbox", { name: "Title" }).fill("Game 5 - Edited")
  await page.getByRole("textbox", { name: "Description" }).fill("Playoffs - edited")
  await page.getByRole("textbox", { name: "Location" }).fill("New Location")
  await page.getByRole("textbox", { name: "Opponent" }).fill("New Opponent")
  await page.getByRole("spinbutton", { name: "Team Score" }).fill("25")
  await page.getByRole("spinbutton", { name: "Opponent Score" }).fill("20")

  await page.getByRole("button", { name: "Save" }).click()

  await expect(page.getByRole("heading", { name: "Game 5 - Edited" })).toBeVisible()
  await expect(page.getByText("Playoffs - edited")).toBeVisible()
  await expect(page.getByText("New Location")).toBeVisible()
  await expect(page.getByText("New Opponent")).toBeVisible()
  await expect(page.getByText("25", { exact: true })).toBeVisible()
  await expect(page.getByText("20", { exact: true })).toBeVisible()
})

test("filter events by date range", async ({ page }) => {
  await page.goto("/alpha-squad/events?from=2025-08-06&to=2025-08-08")
  await expect(page.getByText("Game")).toHaveCount(2)
})

test("navigate to event details", async ({ page }) => {
  await page.goto("/alpha-squad/events")
  await page.getByRole("heading", { name: "Game 5" }).click()

  await expect(page.getByRole("tab", { name: "Details" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Court" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Statistics" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Game 5" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Attendees" })).toBeVisible()
})
