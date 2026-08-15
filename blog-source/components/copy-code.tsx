"use client";

import { useEffect } from "react";

const copyIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><rect x="9" y="9" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2"></path></svg>';

const checkIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

export function CopyCode() {
  useEffect(() => {
    const cleanups = Array.from(
      document.querySelectorAll<HTMLElement>(".research-prose figure[data-rehype-pretty-code-figure]")
    ).flatMap((figure) => {
      const pre = figure.querySelector("pre");

      if (!pre || figure.querySelector(".copy-code-button")) {
        return [];
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-button";
      button.setAttribute("aria-label", "Copy code");
      button.title = "Copy code";
      button.innerHTML = copyIcon;

      async function handleClick() {
        const code = pre?.textContent ?? "";
        await navigator.clipboard.writeText(code);
        button.innerHTML = checkIcon;
        window.setTimeout(() => {
          button.innerHTML = copyIcon;
        }, 1200);
      }

      button.addEventListener("click", handleClick);
      figure.appendChild(button);

      return [
        () => {
          button.removeEventListener("click", handleClick);
          button.remove();
        }
      ];
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
