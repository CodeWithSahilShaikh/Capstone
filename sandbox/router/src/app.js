import express from 'express';
import morgan from 'morgan';
import pkg from 'http-proxy-middleware';
const createProxyMiddleware = pkg.createProxyMiddleware || pkg;

const app = express();
app.use(morgan('dev'));

app.use('/api/status/healthz', (req, res) => {
    res.status(200).json({ message: 'OK' });
})

app.use('/api/status/readyz', (req, res) => {
    res.status(200).json({ message: 'OK' });
})

app.use((req, res, next) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];



    const target = `http://sandbox-service-${sandboxId}.default.svc.cluster.local:80`;

    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,
        onError: (err, req, res) => {
            console.error(`Proxy Error: ${err.message} (${err.code}) for target ${target}`);
            res.status(502).send(`Proxy Error: ${err.message} (${err.code})`);
        }
    });

    return proxy(req, res, next);
})

export default app