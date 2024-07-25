# Simple Messenger

This is a messenger like application build according to [messenger-video](https://github.com/AntonioErdeljac/messenger-video) but with some changes like using `socket.io` instead of `pusher`.

## Features

- Real-time messaging, status updates and chat room update using `socket.io`
- User authentication with `next-auth`
- Relationship Database with `prisma` and `mongodb`
- Image upload with `uploadthing`

## Development

```bash
npm install
npm start
```

## Production

```bash
# this will build the server.ts file and next.js app
npm build
```
