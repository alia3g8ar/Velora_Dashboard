import { useEffect } from "react";

const isVisible = (el: Element): boolean => {
  const style = getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
};

const hasOpenOverlay = (): boolean => {
  const modalOpen = [...document.querySelectorAll(".ant-modal-wrap")].some(
    isVisible,
  );
  const drawerOpen = [...document.querySelectorAll(".ant-drawer")].some(
    (el) =>
      isVisible(el) &&
      (el.classList.contains("ant-drawer-open") ||
        el.querySelector(".ant-drawer-content-wrapper") !== null),
  );
  return modalOpen || drawerOpen;
};

/**
 * antd Modals/Drawers lock body scroll while open and restore it on close.
 * If a close gets interrupted (rapid clicks, ESC mid-transition, navigation
 * during the leave animation), the inline `overflow: hidden` can stay on
 * <body>, freezing the page scroll until a full refresh. This watchdog
 * restores the lock as soon as the body is locked but no modal or drawer is
 * actually on screen.
 */
export const ScrollLockWatchdog = () => {
  useEffect(() => {
    const releaseLock = (): void => {
      if (
        document.body.style.overflow === "hidden" &&
        !hasOpenOverlay()
      ) {
        document.body.style.overflow = "";
      }
    };

    releaseLock();
    // antd sets the lock as an inline style on <body>, so observing the
    // style attribute catches every lock/unlock without polling.
    const observer = new MutationObserver(releaseLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("popstate", releaseLock);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", releaseLock);
    };
  }, []);

  return null;
};
