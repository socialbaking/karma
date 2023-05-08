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
            username: {
                type: "string"
            }
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
                const {
                    username
                } = request.query;
                const partnerId = getAuthorizedForPartnerId();
                const {
                    partnerName
                } = await getPartner(partnerId);
                const accessToken = getAccessToken();
                const url = getOrigin();
                response.header("Content-Type", "text/html");
                response.send(`
                    <p>Authenticated as partner: ${partnerName}</p>
                    <p>Karma API version: ${packageIdentifier}</p>
                    <form id="request-code-form">
                        <h4>Request a new code</h4>
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
                                    const url = new URL("/api/version/1/generate-unique-code", "${url}");
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
                                              username: "${username}",
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
                    <hr />
                    <form id="get-code-form">
                        <h4>Get code details</h4>
                        <p>
                            <input type="text" name="uniqueCode" placeholder="Unique Code" /> 
                        </p>
                        <button type="button" class="button button-primary" id="get-code">Get Code Info</button>
                        <span id="get-code-result"></span>
                        <script type="application/javascript">
                            const getCodeButton = document.getElementById("get-code");
                            const getCodeResult = document.getElementById("get-code-result");
                            getCodeButton.addEventListener("click", (event) => {
                                event.preventDefault();
                                getCodeButton.disabled = true;
                                
                                void run().finally(() => {
                                    getCodeButton.disabled = false;
                                });
                                
                                async function run() {
                                    getCodeResult.innerHTML = "";
                                    const url = new URL("/api/version/1/unique-code-data", "${url}");
                                    const input = document.querySelector("#get-code-form [name='uniqueCode']")
                                    if (!input.value) return;
                                    url.searchParams.set("uniqueCode", input.value);
                                    const response = await fetch(
                                        url.toString(),
                                        {
                                            method: "GET",
                                            headers: {
                                                Authorization: "bearer ${accessToken}"
                                            },
                                            credentials: "omit"
                                        }
                                    );
                                    if (!response.ok) {
                                        return alert("Could not get code");
                                    }
                                    const { uniqueCode, value, acceptedValue } = await response.json();
                                    getCodeResult.innerHTML = "<p class='code-result'>Unique Code: " + uniqueCode + ", value: $" + value + ", accepted value: $" + (acceptedValue || 0) + "</p>";
                                }
                            })
                        </script>
                    </form>
                `)
            }
        }
    );
}