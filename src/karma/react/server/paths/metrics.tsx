import {useMetrics} from "../data/provider";

export function Metrics() {
    const metrics = useMetrics();
    return (
        <div className="metric-list">
            {metrics.map((metric, index) => (
                <div key={index} className="metric-list-item">
                    <div className="metric-list-item-name">{metric.metricsId}</div>
                    <pre className="metric-list-item-values">
                        {JSON.stringify(metric.products, undefined, "  ")}
                    </pre>
                </div>
            ))}
        </div>
    )
}