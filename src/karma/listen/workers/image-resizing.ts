// Duplicated from https://developers.cloudflare.com/images/image-resizing/resize-with-workers/#an-example-worker
import {ExecutionContext} from "@cloudflare/workers-types";

interface FetchImageOptions extends RequestInit {
    cf?: {
        image: Record<string, unknown>
    }
}

// Export a default object containing event handlers
export default {
    // The fetch handler is invoked when this worker receives a HTTP(S) request
    // and should return a Response (optionally wrapped in a Promise)
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Parse request URL to get access to query string
        let url = new URL(request.url)

        // Cloudflare-specific options are in the cf object.
        let options: FetchImageOptions = {cf: {image: {}}}

        // Copy parameters from query string to request options.
        // You can implement various different parameters here.
        if (url.searchParams.has("fit")) options.cf.image.fit = url.searchParams.get("fit")
        if (url.searchParams.has("width")) options.cf.image.width = +url.searchParams.get("width")
        if (url.searchParams.has("height")) options.cf.image.height = +url.searchParams.get("height")
        if (url.searchParams.has("quality")) options.cf.image.quality = url.searchParams.get("quality")

        if (url.searchParams.has("draw")) {
            const draw = JSON.parse(url.searchParams.get("draw"));
            if (Array.isArray(draw)) {
                options.cf.image.draw = draw;
            }
        }

        // Your Worker is responsible for automatic format negotiation. Check the Accept header.
        // const accept = request.headers.get("Accept");
        // if (/image\/avif/.test(accept)) {
        //     options.cf.image.format = 'avif';
        // } else if (/image\/webp/.test(accept)) {
        //     options.cf.image.format = 'webp';
        // }

        // Get URL of the original (full size) image to resize.
        // You could adjust the URL here, e.g., prefix it with a fixed address of your server,
        // so that user-visible URLs are shorter and cleaner.
        const imageURL = url.searchParams.get("image")
        if (!imageURL) return new Response('Missing "image" value', {status: 400})

        try {
            // TODO: Customize validation logic
            const url = new URL(imageURL);
            const {pathname} = url

            // Optionally, only allow URLs with JPEG, PNG, GIF, or WebP file extensions
            // @see https://developers.cloudflare.com/images/url-format#supported-formats-and-limitations
            if (!/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
                return new Response('Disallowed file extension', {status: 400})
            }

            // Demo: Only accept "example.com" images
            //  const { hostname } = url;
            // if (hostname !== 'example.com') {
            //     return new Response('Must use "example.com" source images', { status: 403 })
            // }
        } catch (err) {
            return new Response('Invalid "image" value', {status: 400})
        }

        // Build a request that passes through request headers
        const imageRequest = new Request(imageURL, {
            headers: request.headers
        })

        console.log(options.cf);

        // Returning fetch() with resizing options will pass through response with the resized image.
        return fetch(imageRequest, options)
    }
}