const promClient = require("prom-client");

const register = new promClient.Registry();

promClient.collectDefaultMetrics({
    register,
    prefix: "cloudapp_",
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

const httpRequestsTotal = new promClient.Counter({
    name: "cloudapp_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
});

const httpRequestDurationMs = new promClient.Histogram({
    name: "cloudapp_http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500],
    registers: [register],
});

const httpActiveConnections = new promClient.Gauge({
    name: "cloudapp_http_active_connections",
    help: "Number of active HTTP connections",
    registers: [register],
});

const dbQueriesTotal = new promClient.Counter({
    name: "cloudapp_db_queries_total",
    help: "Total number of database queries",
    labelNames: ["query_type", "status"],
    registers: [register],
});

const dbQueryDurationMs = new promClient.Histogram({
    name: "cloudapp_db_query_duration_ms",
    help: "Duration of database queries in ms",
    labelNames: ["query_type"],
    buckets: [1, 5, 10, 25, 50, 100, 500],
    registers: [register],
});

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    httpActiveConnections.inc();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const route = req.route ? req.route.path : req.path;

        httpRequestsTotal
            .labels(req.method, route, res.statusCode)
            .inc();

        httpRequestDurationMs
            .labels(req.method, route, res.statusCode)
            .observe(duration);

        httpActiveConnections.dec();
    });

    next();
};

module.exports = {
    register,
    metricsMiddleware,
    dbQueriesTotal,
    dbQueryDurationMs,
};