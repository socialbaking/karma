import {Data, DataProvider} from "./data/provider";
import {paths} from "./paths";
import {getOrigin} from "../../listen/config";
import {Layout} from "./layout";

export interface KarmaServerProps extends Data {
    url: string;
}

export default function KarmaServer(options: KarmaServerProps) {
    const {
        pathname
    } = new URL(options.url, getOrigin());

    const Component = paths[pathname];

    if (!Component) {
        return <div>Could not find {pathname}</div>
    }

    let children = <Component />;

    if (!options.isFragment) {
        children = (
            <Layout url={options.url}>
                {children}
            </Layout>
        );
    }

    return (
        <DataProvider value={options}>
            {children}
        </DataProvider>
    );
}