import {File, getProductFile, getProductFiles, listProducts, Product} from "../../../data";
import {FastifyRequest} from "fastify";
import {useParams, useProduct, useInput, useProducts, useData} from "../data";
import {ok} from "../../../../is";
import {isAnonymous} from "../../../authentication";
import {getImageResizingUrl, getSize} from "../../../data/file";
import {CopyrightInfo} from "./products";
import {useMemo} from "react";

interface ProductInfo {
    images: File[];
}

export async function handler(): Promise<ProductInfo> {
    const products = await listProducts({
        public: isAnonymous()
    });
    const images = (await Promise.all(
        products.map(({ productId }) => getProductFiles(productId, {
            accept: "image",
            public: isAnonymous(),
            size: isAnonymous() ? 600 : getSize()
        }))
    ))
        .filter(Boolean)
        .flatMap<File>(value => value)
        .filter(Boolean)
        .filter(file => file.pinned)
    return { images };
}

export function ImagesPage() {
    const { images } = useInput<ProductInfo>();
    const products = useProducts();
    const filteredProducts = useMemo(() => {
        const productIds: string[] = images.map(image => {
            ok<File & { productId?: string }>(image);
            return image.productId;
        }).filter(Boolean);
        return products.filter(product => productIds.includes(product.productId));
    }, [images, products]);
    const sortIndex = images.map(() => Math.random());
    const { isAnonymous } = useData();
    return (
        <div>
            {isAnonymous ? <CopyrightInfo products={filteredProducts} margin={false} /> : undefined}
            <h1>All Images</h1><br />
            <br /><br />
            <div className="product-gallery-view">
                {images
                    .sort((a, b) => sortIndex[images.indexOf(a)] < sortIndex[images.indexOf(b)] ? -1 : 1)
                    .map(
                        (image, index) => {
                            ok<File & { alt?: string, productId?: string }>(image);
                            let alt = image.alt || image.fileName;
                            if (image.productId) {
                                const product = products.find(product => product.productId === image.productId);
                                if (product) {
                                    alt = product.productName;
                                }
                            }
                            return (
                                <div className="image-container" id={image.fileId} key={index} data-product-id={image.productId}>
                                    <img title={alt} alt={alt} src={image.url} />
                                </div>
                            )
                        }
                    )
                }
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
            
            .product-gallery-view {
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: start;
            }
            
            .product-gallery-view .image-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 600px;
                max-width: 100vw;
            }
            
            .product-gallery-view .image-container img {
                max-width: 100%;
                object-fit: contain;
                padding: 0 15px 15px;
            }
            
            `.trim()}} />
            <CopyrightInfo products={filteredProducts} margin={false} />
        </div>
    )
}