import { fireEvent, render, screen, within } from "@testing-library/react";
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

describe("TimestampConverter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
