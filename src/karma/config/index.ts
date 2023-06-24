import { withConfig } from "@opennetwork/logistics";
import {views} from "../react/server/paths";
import {alternativeRoleNames, namedRoles} from "../data";
import {Config} from "@opennetwork/logistics";
// import type {PaymentForm} from "@opennetwork/logistics/esnext/react/server/paths/order/types";
// import {v4} from "uuid";
// import {getOrigin} from "../listen/config";
// import {ok} from "../../is";
//
// function getPaymentCallbackUrls() {
//     return {};
// }

export function configure<R>(fn: () => R): R {
    return withConfig({
        views,
        namedRoles,
        alternativeRoleNames,
        // async getPaymentForm({ order, total, offers }): Promise<PaymentForm> {
        //
        //     const merchantReference = v4();
        //
        //     const response = await fetch("https://payment.provider/create-payment", {
        //       method: "POST",
        //       body: JSON.stringify({
        //         type: "purchase",
        //         amount: total,
        //         currency: offers[0].currencyCode,
        //         merchantReference,
        //         methods: ["card"],
        //         callbackUrls: getPaymentCallbackUrls(),
        //         notificationUrl: new URL(
        //             `/api/version/1/payments/methods/notification/${merchantReference}`,
        //             getOrigin()
        //         ).toString()
        //       }),
        //       headers: {
        //           "Content-Type": "application/json"
        //       }
        //     });
        //     ok(response.ok);
        //     const { links } = await response.json();
        //
        //     return {
        //         url: links.find(link => link.method === "GET").href,
        //         method: "GET"
        //     };
        // }
    }, fn);
}