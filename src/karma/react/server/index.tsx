import { Data, DataProvider } from "./data/provider";
import { paths } from "./paths";
import { getOrigin } from "../../listen/config";
import { AnonymousLayout, Layout, LayoutProps } from "./layout";

export interface KarmaServerProps extends Data {
  url: string;
}

export default function KarmaServer(options: KarmaServerProps) {
  const { pathname } = new URL(options.url, getOrigin());

  const Component = paths[pathname];

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

  return <DataProvider value={options}>{children}</DataProvider>;
}
