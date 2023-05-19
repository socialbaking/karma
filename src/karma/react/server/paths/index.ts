import { FunctionComponent } from "react";
import { Metrics } from "./metrics";
import { Products } from "./products";
import { Partners } from "./partners";
import { Calculator, submit as calculatorSubmit } from "./calculator";
import { Settings } from "./settings";
import { Home } from "./home";
import { Organisations } from "./organisations";
import { Feedback, submit as feedbackSubmit } from "./feedback";
import { Login } from "./login";
import { Logout, handler as logoutHandler } from "./logout";

export const paths: Record<string, FunctionComponent> = {
  "/": Home,
  "/home": Home,
  "/metrics": Metrics,
  "/products": Products,
  "/partners": Partners,
  "/calculator": Calculator,
  "/settings": Settings,
  "/organisations": Organisations,
  "/feedback": Feedback,
  "/login": Login,
  "/logout": Logout,
};

export const pathsAnonymous: Record<string, boolean> = {
  "/home": true,
  "/": true,
  "/feedback": true,
  "/calculator": true,
  "/login": true,
};

export const pathsSubmit: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/calculator": calculatorSubmit,
  "/feedback": feedbackSubmit,
};

export const pathsHandler: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/logout": logoutHandler,
};
