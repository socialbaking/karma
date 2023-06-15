import {File, getProductFile, getProductFiles} from "../../../data";
import {FastifyRequest} from "fastify";
import {useParams, useProduct, useInput} from "../data";
import {ok} from "../../../../is";
import {isAnonymous} from "../../../authentication";
import {CopyrightInfo} from "./products";

export interface ProductInfo {
    images100: File[]
    images600: File[]
}

type Params = {
    productId: string;
}

type Schema = {
    Params: Params
}

export async function handler(request: FastifyRequest<Schema>): Promise<ProductInfo> {
    const { productId } = request.params;
    const images100 = await getProductFiles(productId, {
        accept: "image",
        public: isAnonymous(),
        size: 100
    });
    const images600 = await getProductFiles(productId, {
        accept: "image",
        public: isAnonymous(),
        size: 600
    });
    return { images100: images100.filter(file => file.pinned), images600: images600.filter(file => file.pinned) };
}

export function ProductImages() {
    const { images100, images600 } = useInput<ProductInfo>()
    return (
        <div className="product-gallery">
            <style dangerouslySetInnerHTML={{ __html: `
.product-gallery {
    width: 600px;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
}
.product-gallery-navigation {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.product-gallery-navigation .product-gallery-navigation-item {
    padding: 0;
    margin: 0;
    margin: 5px 10px 10px 0;
}
.product-gallery-navigation .product-gallery-navigation-item a img {
    display: block;
    border: none;
    object-fit: contain;
    height: 100px;
    width: 100px;
}
.product-gallery-navigation .product-gallery-navigation-item a {
    display: block;
}
.product-gallery-view {
    display: flex;
    flex-direction: row;
    width: 600px;
    min-height: 375px;
    overflow-x: hidden;
    float: left;
    z-index: -10;
    position: relative;
    margin-top: -200px;
}
.product-gallery-view .product-gallery-item {
    min-width: 100%;
}
.product-gallery-view .product-gallery-item img {
    min-width: 100%;
    object-fit: cover;
    padding-top: 200px;
}
            `.trim()}} />
            {images100.length ? (
                <ul className="product-gallery-navigation">
                    {images100.map(
                        ({ url, uploadedByUsername, fileId }, index: number) => (
                            <li key={index} className="product-gallery-navigation-item">
                                <a href={`#image-${fileId}`}>
                                    <img src={url} alt={`View product image ${index + 1}`} />
                                </a>
                            </li>
                        )
                    )}
                </ul>
            ) : undefined}
            <div className="product-gallery-view">
                {images600.map(
                    ({ url, uploadedByUsername, fileId }, index: number) => (
                        <div key={index} className="product-gallery-item">
                            <img loading="lazy" id={`image-${fileId}`} src={url} alt={`Product image ${index + 1}${uploadedByUsername ? ` uploaded by ${uploadedByUsername}` : ""}`} />
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
export function ProductPage() {
    const { productId } = useParams<Params>();
    const product = useProduct(productId);
    ok(product, `Could not find product ${productId}`);
    return (
        <div>
            {isAnonymous ? <CopyrightInfo product={product} margin={false} /> : undefined}
            <h1>{product.productName}</h1><br />
            <a
                href={`/calculator?search=${encodeURIComponent(product.productName)}`}
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
                Calculate Metrics
            </a><br /><br />
            <ProductImages />
            <CopyrightInfo product={product} margin={false} />
        </div>
    )
}