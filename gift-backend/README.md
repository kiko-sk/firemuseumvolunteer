# gift-backend

基于 Node.js + Express + MongoDB 的礼品兑换后端服务

## 安装依赖

```sh
pnpm install
```

## 启动开发环境

```sh
pnpm run dev
```

## 启动生产环境

```sh
pnpm start
```

## 环境变量

- `MONGODB_URI`：MongoDB 连接字符串，默认 `mongodb://localhost:27017/giftdb`
- `PORT`：服务端口，默认 8000

## API 接口

- `GET    /api/gifts`      获取所有礼品
- `POST   /api/gifts`      新增礼品
- `PUT    /api/gifts/:id`  编辑礼品
- `DELETE /api/gifts/:id`  删除礼品 