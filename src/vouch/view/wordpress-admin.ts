import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {getPartner} from "../data/partner";
import {getAccessToken, accessToken, getAuthorizedForPartnerId} from "./authentication";
import {packageIdentifier} from "../package";
import {getOrigin} from "../listen/config";

export async function wordpressAdminRoutes(fastify: FastifyInstance) {

    const querystring = {
        type: "object",
        properties: {
        },
        required: [
        ]
    } as const;
    const schema = {
        description: "Retrieve public code data",
        tags: ["patient"],
        summary: "",
        querystring
    }

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/wordpress-admin",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth,
               accessToken
            ]),
            async handler(request, response) {
                const partnerId = getAuthorizedForPartnerId();
                const {
                    partnerName
                } = await getPartner(partnerId);
                const accessToken = await getAccessToken();
                const url = getOrigin();
                response.header("Content-Type", "text/html");
                response.send(`
                    <p>Authenticated as partner: ${partnerName}</p>
                    <p>Vouch API version: ${packageIdentifier}</p>
                    <form id="request-code-form">
                        <p>Request a new code</p>
                        <input type="hidden" name="accessToken" value="${accessToken}" />
                        <p>
                            <input type="number" name="value" placeholder="Dollar Value" /> 
                        </p>
                        <button type="button" class="button button-primary" id="request-code">Request Code</button>
                        <span id="request-code-result"></span>
                        <script type="application/javascript">
                            const requestCodeButton = document.getElementById("request-code");
                            requestCodeButton.addEventListener("click", (event) => {
                                event.preventDefault();
                                requestCodeButton.disabled = true;
                                
                                void run().finally(() => {
                                    requestCodeButton.disabled = false;
                                });
                                
                                async function run() {
                                    const url = new URL("/version/1/generate-unique-code", "${url}");
                                    const valueInput = document.querySelector("#request-code-form [name='value']")
                                    const value = valueInput.value;
                                    if (!value) return;
                                    const response = await fetch(
                                        url.toString(),
                                        {
                                            method: "POST",
                                            headers: {
                                                Authorization: "bearer ${accessToken}",
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify({
                                              partnerId: "${partnerId}",
                                              value: value
                                            }),
                                            credentials: "omit"
                                        }
                                    );
                                    if (!response.ok) {
                                        return alert("Could not create code, please contact support or try again");
                                    }
                                    const { uniqueCode } = await response.json();
                                    const result = document.getElementById("request-code-result");
                                    result.innerHTML = "<p class='unique-code-result'>Unique Code: " + uniqueCode + ", value: $" + value + "</p>";
                                }
                            })
                        </script>
                    </form>
                    <form action="${url}/code-data" method="get">
                        <input type="hidden" name="accessToken" value="${accessToken}" />
                        <p>
                            <input type="text" name="uniqueCode" placeholder="Unique Code" /> 
                        </p>
                        <button type="submit" class="button button-primary">Check Info</button>
                    </form>
                `)
            }
        }
    );
}