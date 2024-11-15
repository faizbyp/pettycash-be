# Petty Cash BE

## Development

```bash
npm run server_dev
```

## Deployment

1. Create Docker Image based on the environment.

- Development

```bash
docker buildx build --platform linux/arm64 -t faizbyp/pettycash-be:x.x.x -f Dockerfile.dev --load .
```

- Production

```bash
docker buildx build --platform linux/arm64 -t faizbyp/pettycash-be:x.x.x -f Dockerfile.prod --load .
```

> The difference between 2 command above is just the environment variable declared inside the `pm2` command flag

2. Test Locally

- Development

```bash
docker run -p 5000:5000 --env-file .env.development faizbyp/pettycash-be:x.x.x
```

- Production

```bash
docker run -p 5000:5000 --env-file .env.production faizbyp/pettycash-be:x.x.x
```

3. Push the image to Docker Hub.

4. Ask the infra team to update the deployment image based on the updated tag on Docker Hub.

5. Update deployment log in `README.md`

## Deployment Log

### `1.0.2`

- feat: reset password
- update: invoice file name tied to its number
- perf: update order plan and conf pie chart
- perf: update company chart
- fix: server restart after file upload
- remove watch from pm2 config

### `1.0.3`

- feat: new po and new gr notif
- update: add is complete to get po by user
- perf: po completion on single transaction
- feat: po approval notif
- update: company bar chart
- feat: gr approval notif

### `1.0.4`

- feat: cancel po
- update: new po cancel req notif
- update: remove sub_total, grand_total, and amount column
  calculate each every query
- fix: adjust post po query to new table design
- fix: adjust gr query to new table design
- fix: adjust report query to new table design
- feat: edit po on be
- fix: pg date format return
- update: edit return message
- update: add has gr to all get po
- fix: items flag empty array to repvent undefined

### `1.0.5`

- update: plan date on gr details
- update: company orders to company spent
- update: add charts on user dashboard
