import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Canvas from "./Canvas.svelte";
import { PRESETS } from "$lib/canvas/presets";

afterEach(cleanup);

function board(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".board");
  if (!el) throw new Error("board not found");
  return el;
}

// jsdom does not fire CSS transitions, so release the animation lock by hand.
function endTransition(el: HTMLElement) {
  const ev = new Event("transitionend");
  Object.defineProperty(ev, "propertyName", { value: "transform" });
  el.dispatchEvent(ev);
}

describe("Canvas keyboard navigation", () => {
  it("opens plus5 at the centre cell", () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    expect(board(container).dataset.cell).toBe("1,1");
  });

  it("moves down to a filled neighbour on ArrowDown", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(board(container).dataset.cell).toBe("2,1");
  });

  it("ignores input while animating, then accepts after the transition ends", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowDown" }); // 1,1 -> 2,1, now animating
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // ignored (locked)
    expect(board(container).dataset.cell).toBe("2,1");

    endTransition(board(container));
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // 2,1 -> 1,1
    expect(board(container).dataset.cell).toBe("1,1");
  });

  it("does not move toward an empty neighbour", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // 1,1 -> 0,1
    endTransition(board(container));
    await fireEvent.keyDown(window, { key: "ArrowLeft" }); // 0,0 is empty -> no move
    expect(board(container).dataset.cell).toBe("0,1");
  });
});
