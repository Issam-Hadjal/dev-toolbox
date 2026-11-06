import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TimestampConverter from "./timestamp-converter";

function timestampSection() {
  return screen.getByRole("region", { name: /Horodatage/ });
}

function dateSection() {
  return screen.getByRole("region", { name: /Date/ });
}

const PARIS_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

const UTC_VALUE = "1970-01-01T00:00:00.000Z";
const PARIS_VALUE = PARIS_FORMATTER.format(new Date(0));
const SECONDS_VALUE = "1";
const MILLISECONDS_VALUE = "1000";

const COPY_BUTTON_NAMES = {
  utc: "Copier la date (UTC)",
  paris: "Copier la date (Paris)",
  seconds: "Copier les secondes",
  milliseconds: "Copier les millisecondes",
} as const;

/** Fills both sections so that the four result lines are displayed. */
function renderWithResults() {
  render(<TimestampConverter />);

  const timestamp = timestampSection();
  fireEvent.change(within(timestamp).getByLabelText("Horodatage"), {
    target: { value: "0" },
  });
  fireEvent.click(within(timestamp).getByRole("button", { name: "Convertir" }));

  const date = dateSection();
  fireEvent.change(within(date).getByLabelText(/Date/), {
    target: { value: "1970-01-01T00:00:01Z" },
  });
  fireEvent.click(within(date).getByRole("button", { name: "Convertir" }));
}

/** Installs a fake clipboard on `navigator` and returns its writeText spy. */
function stubClipboard(writeText: (value: string) => Promise<void>) {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: spy },
    configurable: true,
  });
  return spy;
}

/** Clicks a copy button and lets the clipboard promise settle. */
async function clickCopyButton(accessibleName: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: accessibleName }));
    await Promise.resolve();
  });
}

/** Lets the two-second feedback timer elapse. */
async function waitForFeedbackToExpire() {
  await act(async () => {
    vi.advanceTimersByTime(2000);
  });
}

describe("TimestampConverter", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, "clipboard");
  });

  it("converts a valid timestamp and reports the unit and the UTC date", () => {
    render(<TimestampConverter />);
    const section = timestampSection();

    fireEvent.change(within(section).getByLabelText("Horodatage"), {
      target: { value: "0" },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));

    expect(within(section).getByText("secondes")).toBeTruthy();
    expect(within(section).getByText("1970-01-01T00:00:00.000Z")).toBeTruthy();
  });

  it("shows a French message for an invalid timestamp instead of failing", () => {
    render(<TimestampConverter />);
    const section = timestampSection();

    fireEvent.change(within(section).getByLabelText("Horodatage"), {
      target: { value: "abc" },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));

    expect(within(section).getByText(/entier valide/)).toBeTruthy();
  });

  it("fills the timestamp field with the current timestamp on Maintenant", () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    render(<TimestampConverter />);
    const section = timestampSection();

    fireEvent.click(within(section).getByRole("button", { name: "Maintenant" }));

    expect((within(section).getByLabelText("Horodatage") as HTMLInputElement).value).toBe(String(now));
  });

  it("displays the unit and the UTC date on Maintenant without converting", () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    render(<TimestampConverter />);
    const section = timestampSection();

    fireEvent.click(within(section).getByRole("button", { name: "Maintenant" }));

    expect(within(section).getByText("millisecondes")).toBeTruthy();
    expect(within(section).getByText(new Date(now).toISOString())).toBeTruthy();
    expect(
      within(section).getByText(PARIS_FORMATTER.format(new Date(now))),
    ).toBeTruthy();
  });

  it("clears the timestamp result when the field changes after a conversion", () => {
    render(<TimestampConverter />);
    const section = timestampSection();
    const input = within(section).getByLabelText("Horodatage");

    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));
    expect(within(section).getByText("1970-01-01T00:00:00.000Z")).toBeTruthy();

    fireEvent.change(input, { target: { value: "1" } });

    expect(within(section).queryByText("1970-01-01T00:00:00.000Z")).toBeNull();
  });

  it("clears the timestamp error when the field changes after an error", () => {
    render(<TimestampConverter />);
    const section = timestampSection();
    const input = within(section).getByLabelText("Horodatage");

    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));
    expect(within(section).getByText(/entier valide/)).toBeTruthy();

    fireEvent.change(input, { target: { value: "0" } });

    expect(within(section).queryByText(/entier valide/)).toBeNull();
  });

  it("converts a valid date into seconds and milliseconds", () => {
    render(<TimestampConverter />);
    const section = dateSection();

    fireEvent.change(within(section).getByLabelText(/Date/), {
      target: { value: "1970-01-01T00:00:01Z" },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));

    expect(within(section).getByText("1")).toBeTruthy();
    expect(within(section).getByText("1000")).toBeTruthy();
  });

  it("rejects a date without a timezone with a French message", () => {
    render(<TimestampConverter />);
    const section = dateSection();

    fireEvent.change(within(section).getByLabelText(/Date/), {
      target: { value: "2024-01-01T12:00:00" },
    });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));

    expect(within(section).getByText(/fuseau horaire/)).toBeTruthy();
  });

  it("clears the date result when the field changes after a conversion", () => {
    render(<TimestampConverter />);
    const section = dateSection();
    const input = within(section).getByLabelText(/Date/);

    fireEvent.change(input, { target: { value: "1970-01-01T00:00:01Z" } });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));
    expect(within(section).getByText("1")).toBeTruthy();
    expect(within(section).getByText("1000")).toBeTruthy();

    fireEvent.change(input, { target: { value: "1970-01-01T00:00:02Z" } });

    expect(within(section).queryByText("1")).toBeNull();
    expect(within(section).queryByText("1000")).toBeNull();
  });

  it("clears the date error when the field changes after an error", () => {
    render(<TimestampConverter />);
    const section = dateSection();
    const input = within(section).getByLabelText(/Date/);

    fireEvent.change(input, { target: { value: "2024-01-01T12:00:00" } });
    fireEvent.click(within(section).getByRole("button", { name: "Convertir" }));
    expect(within(section).getByText(/fuseau horaire/)).toBeTruthy();

    fireEvent.change(input, { target: { value: "2024-01-01T12:00:00Z" } });

    expect(within(section).queryByText(/fuseau horaire/)).toBeNull();
  });

  it("shows a « Copier » button next to each of the four result values", () => {
    renderWithResults();

    const expected: Array<[string, string]> = [
      [COPY_BUTTON_NAMES.utc, UTC_VALUE],
      [COPY_BUTTON_NAMES.paris, PARIS_VALUE],
      [COPY_BUTTON_NAMES.seconds, SECONDS_VALUE],
      [COPY_BUTTON_NAMES.milliseconds, MILLISECONDS_VALUE],
    ];

    for (const [name, value] of expected) {
      const button = screen.getByRole("button", { name });
      expect(button.textContent).toBe("Copier");
      expect(button.closest("dd")?.textContent ?? "").toContain(value);
    }
  });

  it("copies the displayed value of each of the four lines, unchanged", async () => {
    const writeText = stubClipboard(async () => {});
    renderWithResults();

    await clickCopyButton(COPY_BUTTON_NAMES.utc);
    await clickCopyButton(COPY_BUTTON_NAMES.paris);
    await clickCopyButton(COPY_BUTTON_NAMES.seconds);
    await clickCopyButton(COPY_BUTTON_NAMES.milliseconds);

    expect(writeText.mock.calls.map(([value]) => value)).toEqual([
      UTC_VALUE,
      PARIS_VALUE,
      SECONDS_VALUE,
      MILLISECONDS_VALUE,
    ]);
  });

  it("shows « Copié » for two seconds after a copy, then « Copier »", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    stubClipboard(async () => {});
    renderWithResults();

    const utcButton = screen.getByRole("button", {
      name: COPY_BUTTON_NAMES.utc,
    });
    await clickCopyButton(COPY_BUTTON_NAMES.utc);

    expect(utcButton.textContent).toBe("Copié");
    expect(
      screen.getByRole("button", { name: COPY_BUTTON_NAMES.paris }).textContent,
    ).toBe("Copier");

    await waitForFeedbackToExpire();

    expect(utcButton.textContent).toBe("Copier");
  });

  it("shows « Copie impossible » for two seconds when the copy fails", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    stubClipboard(async () => {
      throw new Error("presse-papiers refusé");
    });
    renderWithResults();

    const parisButton = screen.getByRole("button", {
      name: COPY_BUTTON_NAMES.paris,
    });
    await clickCopyButton(COPY_BUTTON_NAMES.paris);

    expect(parisButton.textContent).toBe("Copie impossible");

    await waitForFeedbackToExpire();

    expect(parisButton.textContent).toBe("Copier");
  });

  it("shows « Copie impossible » when the clipboard is unavailable", async () => {
    renderWithResults();

    await clickCopyButton(COPY_BUTTON_NAMES.seconds);

    expect(
      screen.getByRole("button", { name: COPY_BUTTON_NAMES.seconds }).textContent,
    ).toBe("Copie impossible");
  });
});
