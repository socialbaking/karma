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
import { Errors } from "./error";
import { UploadReport, submit as uploadSubmit } from "./upload-report";
import { ProductPage, handler as productHandler } from "./product";

export const paths: Record<string, FunctionComponent> = {
  "/": Home,
  "/home": Home,
  "/metrics": Metrics,
  "/products": Products,
  "/product/:productId": ProductPage,
  "/partners": Partners,
  "/calculator": Calculator,
  "/settings": Settings,
  "/organisations": Organisations,
  "/feedback": Feedback,
  "/login": Login,
  "/logout": Logout,
  "/error": Errors,
  "/upload-report": UploadReport,
};

export const pathsAnonymous: Record<string, boolean> = {
  "/home": true,
  "/": true,
  "/products": true,
  "/feedback": true,
  "/calculator": true,
  "/login": true,
  "/product/:productId": true
};

export const pathsSubmit: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/calculator": calculatorSubmit,
  "/feedback": feedbackSubmit,
  "/upload-report": uploadSubmit,
};

export const pathsHandler: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/logout": logoutHandler,
  "/product/:productId": productHandler,
};

export const pathsCache: Record<string, boolean> = {
  "/": false,
  "/home": false,
  "/metrics": true,
  "/products": true,
  "/partners": true,
  "/calculator": false,
  "/settings": false,
  "/organisations": true,
  "/feedback": false,
  "/login": false,
  "/logout": false,
  "/error": false,
};
