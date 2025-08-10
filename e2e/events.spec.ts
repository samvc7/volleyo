import { DATE_FORMAT } from "@/app/utils"
import { test, expect } from "@playwright/test"
import { format } from "date-fns"

test.only("navigate to team events page", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("combobox", { name: "Select Team" }).click()
  await page.getByRole("option", { name: "Alpha Squad" }).click()

  // await expect(page.getByRole("combobox", { name: "Select Team" })).toBeVisible()
  await expect(page.getByText("Alpha Squad")).toBeVisible()
  await expect(page.getByText("Past Events")).toBeVisible()
  await expect(page.getByText("Game")).toHaveCount(5)
  await expect(page.getByRole("link", { name: "Events" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Statistics" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Members" })).toBeVisible()
})

test.skip("create event", async ({ page }) => {
  await page.goto("/alpha-squad/events")

  await page.getByRole("button", { name: "Add Event" }).click()

  await expect(page.getByRole("heading", { name: "Add Event" })).toBeVisible()
  await page.getByRole("combobox", { name: "" }).click()
  await page.getByRole("option", { name: "MATCH" }).click()

  await page.getByRole("textbox", { name: "Title" }).fill("E2E Test")
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("This is a test event created by Playwright E2E tests.")

  // TODO: update DatePicker version & test date selection
  // await page.getByRole("textbox", { name: "Date" }).fill(format(new Date(), DATE_FORMAT))

  await page.getByRole("textbox", { name: "Time" }).fill("10:00")
  await page.getByRole("textbox", { name: "Location" }).fill("Test Location")

  await page.getByRole("button", { name: "Save" }).click()

  await expect(page.getByText("E2E Test")).toBeVisible()
  // past events,
})

test.skip("filter events by date range", async ({ page }) => {
  await page.goto("/alpha-squad/events")
  // Add logic to filter events by date range
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
