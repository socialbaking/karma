import * as MetricsView from "./metrics";
import * as ProductsView from "./products";
import * as PartnersView from "./partners";
import * as CalculatorView from "./calculator";
import * as SettingsView from "./settings";
import * as HomeView from "./home";
import * as HomeIndexView from "./home-index";
import * as OrganisationsView from "./organisations";
import * as FeedbackView from "./feedback";
import * as LoginView from "./login";
import * as LogoutView from "./logout";
import * as ErrorsView from "./error";
import * as UploadReportView from "./upload-report";
import * as ProductView from "./product";
import * as ImagesView from "./images";
import {View} from "@opennetwork/logistics";

export const views: View[] = [
    MetricsView,
    ProductsView,
    // PartnersView,
    CalculatorView,
    SettingsView,
    HomeView,
    HomeIndexView,
    // OrganisationsView,
    FeedbackView,
    // LoginView,
    // LogoutView,
    // ErrorsView,
    ProductView,
    UploadReportView,
    ImagesView
];
