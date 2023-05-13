import {Data, DataProvider} from "./data/provider";
import {paths} from "./paths";
import {getOrigin} from "../../listen/config";

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

    return (
        <DataProvider value={options}>
            <Component />
        </DataProvider>
    );
}