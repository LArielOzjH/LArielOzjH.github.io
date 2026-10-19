// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AwardExplorer } from "./award-explorer";

afterEach(cleanup);

describe("AwardExplorer", () => {
  it("opens with paper awards and exposes direct paper and evidence links", () => {
    render(<AwardExplorer />);
    expect(screen.getByRole("combobox", { name: "Award category" }).getAttribute("id")).toBeTruthy();
    expect(screen.getByText("113 award records")).toBeTruthy();
    expect(screen.getByRole("link", { name: "The XOR Cache: A Catalyst for Compression" }).getAttribute("href")).toBe("https://doi.org/10.1145/3695053.3730995");
    expect(screen.getByRole("link", { name: "Award evidence for The XOR Cache: A Catalyst for Compression" }).getAttribute("href")).toBe("https://www.iscaconf.org/isca2025/index.php");
  });

  it("filters by award year rather than the year an influential paper appeared", async () => {
    const user = userEvent.setup();
    render(<AwardExplorer />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Award category" }), "long_term");
    await user.selectOptions(screen.getByRole("combobox", { name: "Conference" }), "ISCA");
    await user.selectOptions(screen.getByRole("combobox", { name: "Award year" }), "2017");
    expect(screen.getByRole("link", { name: "Drowsy Caches: Simple Techniques for Reducing Leakage Power" })).toBeTruthy();
    expect(screen.getByText("Paper · ISCA 2002")).toBeTruthy();
    expect(screen.getByText("1 award record")).toBeTruthy();
  });

  it("shows an actionable empty state and resets every filter", async () => {
    const user = userEvent.setup();
    render(<AwardExplorer />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Conference" }), "HPCA");
    await user.selectOptions(screen.getByRole("combobox", { name: "Award year" }), "2026");
    expect(screen.getByText("No matching awards")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getByText("113 award records")).toBeTruthy();
    await user.type(screen.getByRole("searchbox", { name: "Search paper titles" }), "xOr cache");
    expect(screen.getByText("1 award record")).toBeTruthy();
  });
});
