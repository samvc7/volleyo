import { getInviteLink } from "@/app/event/[slug]/AddMembersDialog"
import { DATE_ISO_FORMAT } from "@/app/utils"
import { test, expect } from "@playwright/test"
import { format, subDays } from "date-fns"
test.describe("events page", () => {
  test("navigate to team events page", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("combobox", { name: "Select Team" }).click()
    await page.getByRole("option", { name: "Alpha Team" }).click()

    await expect(page.getByText("Alpha Team")).toBeVisible()
    await expect(page.getByText("Past Events")).toBeVisible()
    await expect(page.getByText("Game")).toHaveCount(5)
    await expect(page.getByRole("link", { name: "Events" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Statistics" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Members" })).toBeVisible()
  })

  test("create event", async ({ page }) => {
    await page.goto("/alpha-team/events")

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

  test("filter events by date range", async ({ page }) => {
    const fromDate = format(subDays(new Date(), 3), DATE_ISO_FORMAT)
    const toDate = format(subDays(new Date(), 1), DATE_ISO_FORMAT)
    await page.goto(`/alpha-team/events?from=${fromDate}&to=${toDate}`)
    await expect(page.getByText("Game")).toHaveCount(2)
  })
})

test.describe("event details", () => {
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

  test("navigate to event details", async ({ page }) => {
    await page.goto("/alpha-team/events")
    await page.getByRole("heading", { name: "Game 5" }).click()

    await expect(page.getByRole("tab", { name: "Details" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Court" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Statistics" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Game 5" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Attendees" })).toBeVisible()
  })
})

test.describe("authorization admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/event/game-4")
  })
  test("can add members to event", async ({ page, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "Because of race condition testing parallel browsers we just test for chromium",
    )

    await page.getByRole("button", { name: "Add Members" }).click()
    await expect(page.getByRole("heading", { name: "Add Members" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Invite Link" })).toBeVisible()

    await page.getByRole("button", { name: "Team Members" }).click()
    await page.getByRole("option", { name: "Bridget" }).click()
    await page.getByRole("option", { name: "Close" }).click()

    await page.getByRole("button", { name: "Other Members" }).click()
    await page.getByRole("option", { name: "Aria" }).click()
    await page.getByRole("option", { name: "close" }).click()

    await page.getByRole("button", { name: "Add" }).click()
    await expect(page.getByRole("heading", { name: "Add Members" })).not.toBeVisible()

    await expect(page.getByText("Bridget")).toBeVisible()
    await expect(page.getByText("Aria")).toBeVisible()
    await expect(page.getByText("Guest")).toBeVisible()
  })

  test("can edit attendee position", async ({ page }) => {
    await page.getByRole("button", { name: "Edit Position Caro" }).click()
    await expect(page.getByRole("heading", { name: "Edit Position" })).toBeVisible()
    await page.getByRole("button", { name: "Positions" }).click()
    await page.getByRole("option", { name: "L", exact: true }).click()
    await page.getByRole("option", { name: "OH" }).click()
    await page.getByRole("option", { name: "close" }).click()
    await page.getByRole("button", { name: "Save" }).click()

    const positions = page.getByRole("list", { name: "Positions Caro" })
    await expect(positions.getByRole("listitem").filter({ hasText: "L" })).toBeVisible()
    await expect(positions.getByRole("listitem").filter({ hasText: "OH" })).toBeVisible()
  })

  test("can edit attendee number", async ({ page }) => {
    await page.getByRole("button", { name: "Edit Player Number Caro" }).click()
    await page.getByRole("spinbutton").fill("10")
    await page.getByRole("button", { name: "Edit Player Number Caro" }).click()
    await expect(page.getByText("10")).toBeVisible()
  })

  test("can accept invitation", async ({ page }) => {
    await page.getByRole("button", { name: "Accept Invitation Milani" }).click()
    await expect(page.getByText("Are you sure you are Milani Lee")).toBeVisible()
    await page.getByRole("button", { name: "Accept" }).click()

    await expect(page.getByRole("listitem").filter({ hasText: "Milani" }).getByText("Accepted")).toBeVisible()
  })

  test("can decline invitation", async ({ page }) => {
    await page.getByRole("button", { name: "Decline Invitation Milani" }).click()
    await expect(page.getByText("Are you sure")).toBeVisible()
    await expect(page.getByText("Milani Lee?")).toBeVisible()
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("listitem").filter({ hasText: "Milani" }).getByText("Declined")).toBeVisible()
  })

  test("inviation link", async ({ page, browser }) => {
    const origin = new URL(page.url()).origin

    await page.getByRole("button", { name: "Add Members" }).click()
    await page.getByRole("button", { name: "Invite Link" }).click()

    // Not testing clipboard functionality because of errors in Playwright when reading clipboard
    const inviteUrl = await getInviteLink("game-4", origin)
    const urlWithoutBase = inviteUrl.replace(origin, "")
    expect(urlWithoutBase).toContain("event/invite?event=")
    expect(urlWithoutBase).toContain("token=")

    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()

    await guestPage.goto(urlWithoutBase)
    await expect(guestPage.getByRole("heading", { name: "invited to" })).toBeVisible()

    await guestPage.getByRole("button", { name: "Accept Invitation Mia" }).click()
    await expect(guestPage.getByText("Are you sure")).toBeVisible()
    await expect(guestPage.getByText("Mia Lopez?")).toBeVisible()
    await guestPage.getByRole("button", { name: "Accept" }).click()
    await expect(guestPage.getByText("Details")).toBeVisible()
    await expect(guestPage.getByRole("tab", { name: "Details" })).toBeVisible({ timeout: 20000 })
    await expect(
      guestPage.getByRole("listitem").filter({ hasText: "Mia Lopez" }).getByText("Accepted"),
    ).toBeVisible()
  })
})

test.describe("authorization guest", () => {
  test.use({ storageState: "./e2e/auth/guest.json" })

  test("cannot add members to event", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Add Members" })).toHaveCount(0)
  })

  test("cannot edit event", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Edit Event" })).toHaveCount(0)
  })

  test("cannot edit attendee position", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Edit Position Caro" })).toHaveCount(0)
  })

  test("cannot accept invitation", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Accept Invitation Milani" })).toHaveCount(0)
  })

  test("cannot decline invitation", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Decline Invitation Milani" })).toHaveCount(0)
  })

  test("cannot edit attendee number", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Edit Player Number Caro" })).toHaveCount(0)
  })

  test("cannot edit attendee positions", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("button", { name: "Edit Position Caro" })).toHaveCount(0)
  })

  test("cannot see court tracker", async ({ page }) => {
    await page.goto("/event/game-3")
    await expect(page.getByRole("tab", { name: "Details" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Statistics" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "Court" })).toHaveCount(0)
  })
})
