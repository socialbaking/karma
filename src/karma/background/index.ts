import {getBackground} from "../data";

export interface BackgroundInput extends Record<string, unknown> {

}

export async function background(input: BackgroundInput) {

    console.log(`Running background tasks`, input);

    const complete = await getBackground({
        someInitialData: "start"
    });

    console.log("Running some background thing");
    await new Promise(resolve => setTimeout(resolve, 2500));
    console.log("Completed some background thing");

    await complete({
        someCompletedData: "complete"
    });

}