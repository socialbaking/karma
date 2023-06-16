import { ReactData, DataProvider } from "./data";
import { getOrigin } from "../../listen/config";
import { AnonymousLayout, Layout, LayoutProps } from "./layout";
import {DataProvider as BaseDataProvider, View} from "@opennetwork/logistics";

export interface KarmaServerProps extends ReactData {
  view: View;
}

export default function KarmaServer(options: KarmaServerProps) {
  const { pathname } = new URL(options.url, getOrigin());
  const { view: { Component } } = options;

  if (!Component) {
    return <div>Could not find {pathname}</div>;
  }

  let children = <Component />;

  if (!options.isFragment) {
    const layoutProps: LayoutProps = {
      url: options.url,
    };
    if (options.isAnonymous) {
      children = <AnonymousLayout {...layoutProps}>{children}</AnonymousLayout>;
    } else {
      children = <Layout {...layoutProps}>{children}</Layout>;
    }
  }

  return (
      <BaseDataProvider value={options}>
        <DataProvider value={options}>{children}</DataProvider>
      </BaseDataProvider>
  );
}
