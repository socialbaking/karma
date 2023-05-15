import {useMetrics, useProducts} from "../data/provider";
import {MetricsGraph} from "../../client/components/graph";

export function Metrics() {
    const metrics = useMetrics();
    const products = useProducts();
    return (
        <div className="metric-list">
            {metrics.map((metric, index) => (
                <div key={index} className="metric-list-item">
                    <div className="metric-list-item-name">{metric.duration} {metric[metric.reportingDateKey]}</div>
                    <br />
                    {
                        metric.products
                            .map(({ productId, activeIngredients }) => {
                                const product = products.find(product => product.productId === productId);
                                if (!product) return undefined;
                                return (
                                    <div>
                                        <strong>Product: {product.productName}</strong><br/>
                                        <ul className="list-disc list-outside">
                                            {
                                                activeIngredients
                                                    .sort((a, b) => {
                                                        if (a.type !== b.type) return a.type > b.type ? -1 : 1;
                                                        if (a.prefix && !b.prefix) return -1;
                                                        if (b.prefix && !a.prefix) return 1;
                                                        return a.value < b.value ? -1 : 1;
                                                    })
                                                    .map(({ type, unit, value, prefix }) => {
                                                        return <li>{prefix || ""}{value} {unit} {type}</li>
                                                    })
                                            }
                                        </ul>
                                        <br />
                                    </div>
                                )
                            })
                    }
                    <MetricsGraph metrics={[metric]} />
                </div>
            ))}
        </div>
    )
}