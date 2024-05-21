export default function handler(req, res) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }
    // make a POST call
    fetch(`${process.env.CRON_URL}`, {
        method: 'POST',
    })
    // return a response
    res.status(200).end('Hello Cron!');
}