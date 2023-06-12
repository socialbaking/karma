import {File, getProductFile, getProductFiles} from "../../../data";
import {FastifyRequest} from "fastify";
import {useParams, useProduct, useInput} from "../data";
import {ok} from "../../../../is";
import {isAnonymous} from "../../../authentication";
import {getImageResizingUrl} from "../../../data/file/resolve-file";

interface ProductInfo {
    images: File[]
}

type Params = {
    productId: string;
}

type Schema = {
    Params: Params
}

export async function handler(request: FastifyRequest<Schema>): Promise<ProductInfo> {
    const { productId } = request.params;
    const images = await getProductFiles(productId, {
        accept: "image",
        public: isAnonymous()
    });
    return { images };
}

function ProductImages() {
    const { images } = useInput<ProductInfo>()
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
}
.product-gallery-navigation .product-gallery-navigation-item {
    padding: 0;
    margin: 0;
    margin: 5px 10px 10px 0;
}
.product-gallery-navigation .product-gallery-navigation-item a img {
    display: block;
    border: none;
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
}
.product-gallery-view .product-gallery-item {
    min-width: 100%;
}
.product-gallery-view .product-gallery-item img {
    min-width: 100%;
}
            `.trim()}} />
            <ul className="product-gallery-navigation">
                {images.map(
                    ({ url, uploadedByUsername, fileName }, index: number) => (
                        <li key={index} className="product-gallery-navigation-item">
                            <a href={`#image-${fileName}`}>
                                <img src={getImageResizingUrl(url, { size: 100 }).toString()} alt={`View product image ${index + 1}`} />
                            </a>
                        </li>
                    )
                )}
            </ul>
            <div className="product-gallery-view">
                {images.map(
                    ({ url, uploadedByUsername, fileName }, index: number) => (
                        <div key={index} className="product-gallery-item">
                            <img id={`image-${fileName}`} src={getImageResizingUrl(url, { size: 600 }).toString()} alt={`Product image ${index + 1}${uploadedByUsername ? ` uploaded by ${uploadedByUsername}` : ""}`} />
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
            <h1>{product.productName}</h1><br />
            <a
                href={`/calculator?search=${encodeURIComponent(product.productName)}`}
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
                Calculate Metrics
            </a><br /><br />
            <ProductImages />
        </div>
    )
}