import { calculator } from "./calculator";

export const paths: Record<string, () => void | Promise<void>> = {
  calculator,
};

export function runPath() {
  const { pathname } = window.location;
  const pathFn = paths[pathname];
  if (!pathFn) return;
  return pathFn();
}
