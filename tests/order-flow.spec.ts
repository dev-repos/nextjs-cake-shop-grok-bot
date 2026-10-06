import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/*
 * Drives the shop the way a browser-using AI agent would: only getByRole / getByLabel
 * locators (plus expectations on text). If a step can't be found this way, the page
 * needs fixing, not the test.
 */

const iso = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
};
const PICKUP = iso(10);

/** Each test pretends to come from its own IP so rate limits don't leak between tests. */
const fromIp = (ip: string) => test.use({ extraHTTPHeaders: { "x-forwarded-for": ip } });

const serverLog = () => readFileSync(process.env.E2E_SERVER_LOG!, "utf8");
const emailsFor = (orderNumber: string) =>
  [...serverLog().matchAll(/\[email\][\s\S]*?\[\/email\]/g)].map((m) => m[0]).filter((e) => e.includes(orderNumber));

async function expectAccessible(page: Page, name: string) {
  // After client-side navigations (e.g. a Server Action redirect) Next.js applies the new <title>
  // a moment after the content; wait for it so axe checks the settled page.
  await expect(page).toHaveTitle(/Frostwell Cakes/);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = results.violations.map((v) => `${v.impact} ${v.id} (${v.nodes.length})`).join(", ") || "none";
  test.info().annotations.push({ type: "axe", description: `${name}: ${summary}` });
  expect(serious.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`), `${name}: serious/critical axe violations`).toEqual([]);
}

async function expectOneH1AndLandmarks(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
}

async function addCakeToCart(page: Page, slug: string, button: string) {
  await page.goto(`/cakes/${slug}?size=6&date=${PICKUP}`);
  await page.getByRole("button", { name: button }).click();
  await expect(page.getByRole("status")).toContainText("Added to your cart");
}

async function fillCheckout(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Test Order");
  await page.getByLabel("Phone").fill("+1 503 555 0100");
  await page.getByLabel("Email").fill("test-order@example.com");
  await page.getByLabel("Pickup date").fill(PICKUP);
  await page.getByLabel("Notes").fill("Automated test, please ignore");
}

function signedLink(orderUrl: string, purpose: "accept" | "decline") {
  const url = new URL(orderUrl);
  const orderNumber = url.pathname.split("/")[2];
  const data = url.searchParams.get("d")!;
  const sig = createHmac("sha256", process.env.E2E_ORDER_SECRET!).update(`fw1.${purpose}.${orderNumber}.${data}`).digest("base64url");
  return `/order/${orderNumber}/${purpose}?d=${data}&sig=${sig}`;
}

test.describe("ordering a cake with roles and labels only", () => {
  fromIp("198.51.100.10");

  test("home → cakes → customise → cart → checkout → order page", async ({ page }) => {
    // Home
    await page.goto("/");
    await expectOneH1AndLandmarks(page);
    await expectAccessible(page, "home");

    // Cakes
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Cakes" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/cakes$/);
    await expectOneH1AndLandmarks(page);
    await expectAccessible(page, "cakes");

    // A cake
    await page.getByRole("link", { name: "Pistachio Rose" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Pistachio Rose" })).toBeVisible();
    await expectOneH1AndLandmarks(page);
    const sizes = page.getByRole("region", { name: "Sizes and prices (US dollars)" });
    await expect(sizes).toContainText("8 inch, serves 14–18$82");
    await expect(sizes).toContainText("Order at least 3 days before pickup");

    await page.getByRole("group", { name: "Size" }).getByRole("radio", { name: /^8 inch/ }).check();
    await page.getByRole("group", { name: "Flavour" }).getByRole("radio", { name: /^Salted caramel/ }).check();
    await page.getByRole("group", { name: "Frosting" }).getByRole("radio", { name: /^Raspberry buttercream/ }).check();
    await page.getByLabel("Message on top").fill("Happy 30th, Priya!");
    await page.getByLabel("Pickup date").fill(PICKUP);
    const summary = page.getByRole("region", { name: "Your cake" });
    await expect(summary).toContainText("Salted caramel sponge+$6");
    await expect(summary).toContainText("$88");
    await expectAccessible(page, "cake page");
    await page.getByRole("button", { name: "Add 8-inch Pistachio Rose to cart" }).click();
    await expect(page.getByRole("status")).toContainText("Added to your cart.");
    const cartLink = page.getByRole("banner").getByRole("link", { name: /^Cart/ });
    await expect(cartLink).toHaveAccessibleName("Cart 1 item");

    // Cart
    await cartLink.click();
    await expect(page.getByRole("heading", { level: 1, name: "Your cart" })).toBeVisible();
    await expectOneH1AndLandmarks(page);
    const qty = page.getByLabel("Quantity of Pistachio Rose, 8 inch");
    await expect(qty).toHaveValue("1");
    await qty.selectOption("2");
    await expect(page.getByRole("complementary")).toContainText("$176");
    await qty.selectOption("1");
    await expect(page.getByRole("complementary")).toContainText("$88");
    await expect(page.getByRole("link", { name: "Edit Pistachio Rose, 8 inch" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove Pistachio Rose, 8 inch from cart" })).toBeVisible();
    await expectAccessible(page, "cart");

    // Checkout: errors first
    await page.getByRole("link", { name: "Continue to checkout" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Order request" })).toBeVisible();
    await expectOneH1AndLandmarks(page);
    await expect(page.getByLabel("Phone")).toHaveAttribute("type", "tel");
    await expect(page.getByLabel("Phone")).toHaveAttribute("inputmode", "tel");
    await expect(page.getByLabel("Phone")).toHaveAttribute("autocomplete", "tel");
    await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
    await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute("autocomplete", "name");
    await expect(page.getByLabel("Pickup date")).toHaveAttribute("type", "date");
    // The honeypot is invisible to role-based agents.
    await expect(page.getByRole("textbox", { name: /leave this field empty/i })).toHaveCount(0);
    await expectAccessible(page, "checkout");

    await page.getByRole("button", { name: "Send order request" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Please enter your name.");
    await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Name", { exact: true })).toHaveAccessibleDescription(/Please enter your name\./);
    await expectAccessible(page, "checkout with errors");

    // Checkout: submit
    await fillCheckout(page);
    await page.getByRole("button", { name: "Send order request" }).click();
    await expect(page).toHaveURL(/\/order\/FW-[A-Z0-9]{6}\?d=/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(/^FW-[A-Z0-9]{6}$/);
    const orderNumber = (await heading.textContent())!;
    await expect(page.getByText("Awaiting confirmation")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("$88");
    await expect(page.getByRole("main")).toContainText(`Pickup`);
    await expectOneH1AndLandmarks(page);
    await expectAccessible(page, "order page");
    await expect(cartLink).toHaveAccessibleName("Cart");

    // Both emails were logged (not sent).
    await expect.poll(() => emailsFor(orderNumber).length).toBe(2);
    const orderUrl = page.url();

    // Bakery: accept page, then confirm
    await page.goto(signedLink(orderUrl, "accept"));
    await expectOneH1AndLandmarks(page);
    await expectAccessible(page, "accept page");
    await page.getByRole("button", { name: "Confirm this order" }).click();
    await expect(page.getByRole("status")).toContainText(`Order ${orderNumber} is confirmed`);
    await expectAccessible(page, "accept done");

    // Bakery: the decline link now says the order was already confirmed
    await page.goto(signedLink(orderUrl, "decline"));
    await expect(page.getByRole("main").getByRole("alert")).toContainText("This order was already confirmed");
    await expectAccessible(page, "already used");
  });

  test("decline page is usable with labels", async ({ page }) => {
    await addCakeToCart(page, "lemon-elderflower", "Add 6-inch Lemon Elderflower to cart");
    await page.goto("/checkout");
    await fillCheckout(page);
    await page.getByRole("button", { name: "Send order request" }).click();
    await expect(page.getByText("Awaiting confirmation")).toBeVisible();
    await page.goto(signedLink(page.url(), "decline"));
    await expectOneH1AndLandmarks(page);
    await page.getByRole("button", { name: "Decline this order" }).click();
    await expect(page.getByLabel("Reason for the customer")).toHaveAttribute("aria-invalid", "true");
    await expectAccessible(page, "decline with error");
    await page.getByLabel("Reason for the customer").fill("We're fully booked that weekend, sorry!");
    await page.getByRole("button", { name: "Decline this order" }).click();
    await expect(page.getByRole("status")).toContainText("is declined");
    await expectAccessible(page, "decline done");
  });
});

test("other pages: one h1, landmarks and no serious axe issues", async ({ page }) => {
  for (const [path, h1] of [
    ["/services", "Cakes for every occasion"],
    ["/cart", "Your cart"],
    ["/checkout", "Order request"],
    ["/order/FW-ABCDEF?d=x&sig=y", "Order"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expectOneH1AndLandmarks(page);
    await expectAccessible(page, path);
  }
  await expect(page.getByRole("main").getByRole("alert")).toContainText("This order link isn't valid");
});

test.describe("honeypot", () => {
  fromIp("198.51.100.20");

  test("a filled-in honeypot is quietly rejected and nothing is sent", async ({ page }) => {
    await addCakeToCart(page, "classic-red-velvet", "Add 6-inch Classic Red Velvet to cart");
    await page.goto("/checkout");
    await fillCheckout(page);
    // Simulate a bot that fills every input in the DOM.
    await page.getByLabel("Leave this field empty").evaluate((input: HTMLInputElement) => {
      input.value = "https://spam.example";
    });
    const before = (serverLog().match(/Honeypot field filled/g) ?? []).length;
    await page.getByRole("button", { name: "Send order request" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Sorry, we couldn't send your order request.");
    await expect(page).toHaveURL(/\/checkout$/);
    await expect.poll(() => (serverLog().match(/Honeypot field filled/g) ?? []).length).toBe(before + 1);
    await expect(page.getByRole("banner").getByRole("link", { name: /^Cart/ })).toHaveAccessibleName("Cart 1 item");
  });
});

test.describe("rate limit", () => {
  fromIp("198.51.100.30");

  test("the fourth order in ten minutes is refused, per IP and per browser", async ({ page, browser }) => {
    for (let i = 1; i <= 3; i++) {
      await addCakeToCart(page, "vanilla-bean-berries", "Add 6-inch Vanilla Bean & Berries to cart");
      await page.goto("/checkout");
      await fillCheckout(page);
      await page.getByRole("button", { name: "Send order request" }).click();
      await expect(page.getByText("Awaiting confirmation")).toBeVisible();
    }
    await addCakeToCart(page, "vanilla-bean-berries", "Add 6-inch Vanilla Bean & Berries to cart");
    await page.goto("/checkout");
    await fillCheckout(page);
    await page.getByRole("button", { name: "Send order request" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("You've sent several order requests in the last few minutes.");
    await expect(page).toHaveURL(/\/checkout$/);

    // Same browser (cookie) from a different IP: still limited by the signed cookie.
    const state = await page.context().storageState();
    const other = await browser.newContext({
      storageState: state,
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: { "x-forwarded-for": "198.51.100.31" },
    });
    const page2 = await other.newPage();
    await page2.goto("/checkout");
    await fillCheckout(page2);
    await page2.getByRole("button", { name: "Send order request" }).click();
    await expect(page2.getByRole("main").getByRole("alert")).toContainText("You've sent several order requests");
    await other.close();
  });
});
