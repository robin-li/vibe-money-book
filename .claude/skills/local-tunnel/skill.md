# 發佈本地服務（Local Tunnel）

將本地前後端開發服務透過隧道發佈至公網，供遠端裝置（手機、平板、外部測試者）存取。

## 觸發時機

- 使用者提到「發佈本地服務」、「發佈前後端服務」
- 使用者需要「遠端進行測試或驗證」
- 需要在手機上測試 PWA、語音輸入等功能
- 需要讓外部人員存取本地開發環境

## 支援的隧道工具

| 工具 | 優點 | 缺點 | 安裝 |
|------|------|------|------|
| **ngrok** (推薦) | 免費方案可用、設定簡單、支援 HTTPS、有 Web Inspector | 免費方案 URL 隨機、有速率限制 | `brew install ngrok` |
| **Cloudflare Tunnel** | 免費無限制、自訂域名、穩定 | 需 Cloudflare 帳號、設定較複雜 | `brew install cloudflared` |
| **localhost.run** | 零安裝（SSH 即可） | 功能最少、不穩定 | 無需安裝 |

## 行為指引

當使用者呼叫此 skill 時，依序執行以下步驟：

### 步驟 0：環境偵測

1. 確認專案結構，偵測前後端服務配置：
   ```bash
   # 偵測後端 port
   grep -r "port\|PORT\|listen" backend/src/server.ts | head -5
   # 偵測前端 port
   grep -r "port\|PORT" frontend/vite.config.ts | head -5
   ```

2. 檢查已安裝的隧道工具：
   ```bash
   which ngrok 2>/dev/null && ngrok version
   which cloudflared 2>/dev/null && cloudflared version
   ```

3. 檢查前後端服務是否已在運行：
   ```bash
   lsof -ti:3000 2>/dev/null && echo "後端已運行 :3000"
   lsof -ti:5173 2>/dev/null && echo "前端已運行 :5173"
   ```

### 步驟 1：啟動本地服務

若服務尚未運行，詢問使用者是否自動啟動：

```bash
# 後端
cd backend && npm run dev &

# 前端
cd frontend && npm run dev &
```

確認服務可存取：
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health
curl -sk -o /dev/null -w "%{http_code}" https://localhost:5173/
```

### 步驟 2：建立隧道

#### 方案 A：ngrok（推薦）

**單服務模式**（僅前端或後端）：
```bash
# 發佈前端（HTTPS）
ngrok http https://localhost:5173

# 發佈後端
ngrok http http://localhost:3000
```

**多服務模式**（前後端同時）：

建立 ngrok 設定檔 `/tmp/ngrok-tunnel.yml`：
```yaml
version: "3"
tunnels:
  frontend:
    addr: https://localhost:5173
    proto: http
  backend:
    addr: http://localhost:3000
    proto: http
```

啟動：
```bash
ngrok start --config /tmp/ngrok-tunnel.yml --all
```

> **注意**：免費方案僅支援 1 個隧道。多隧道需付費方案或分兩次啟動。
> 若為免費方案，建議僅發佈前端，並將前端的 API proxy 指向本地後端（Vite 已配置 proxy）。

**免費方案單隧道策略**：
- 前端 Vite 已設定 API proxy（`/api` → `localhost:3000`），因此**只需發佈前端**即可同時存取前後端功能
- 確認 `vite.config.ts` 中有 proxy 配置，若無則需補上

#### 方案 B：Cloudflare Tunnel

```bash
# 安裝
brew install cloudflared

# 快速隧道（無需帳號）
cloudflared tunnel --url http://localhost:5173

# 帶帳號（可自訂域名）
cloudflared tunnel login
cloudflared tunnel create dev-tunnel
cloudflared tunnel route dns dev-tunnel dev.your-domain.com
cloudflared tunnel run dev-tunnel
```

#### 方案 C：localhost.run（零安裝）

```bash
ssh -R 80:localhost:5173 nokey@localhost.run
```

### 步驟 3：輸出連線資訊

隧道建立後，以下列格式輸出：

```
🌐 本地服務已發佈
========================
前端：https://{random}.ngrok-free.app
後端：https://{random}.ngrok-free.app/api/v1  (via Vite proxy)

📱 手機測試步驟：
1. 確保手機連上任意網路（不需同一 WiFi）
2. 開啟上方前端 URL
3. ngrok 首次存取會顯示警告頁面，點擊「Visit Site」繼續

⚠️ 注意事項：
- ngrok 免費方案 URL 每次重啟會變更
- 隧道關閉後遠端即無法存取
- 請勿在隧道中傳輸正式環境的 API Key 或敏感資料
```

### 步驟 4：CORS / API 代理檢查

若前端透過隧道存取但 API 呼叫失敗，檢查：

1. **Vite proxy 是否正確**（前端 → 後端同機）：
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true,
       }
     }
   }
   ```

2. **後端 CORS 是否允許隧道域名**：
   ```typescript
   // 若後端有 CORS 限制，需加入 ngrok 域名
   app.use(cors({ origin: [/\.ngrok-free\.app$/] }))
   ```

3. **HTTPS 混合內容問題**：
   - ngrok 提供 HTTPS，但若 API 呼叫指向 `http://localhost`，瀏覽器會阻擋
   - 確保 API 呼叫走相對路徑（`/api/v1/...`）而非絕對路徑

### 步驟 5：關閉隧道

測試完畢後：
```bash
# 關閉 ngrok（Ctrl+C 或）
pkill -f ngrok

# 關閉 cloudflared
pkill -f cloudflared

# 若需一併關閉前後端
lsof -ti:5173 | xargs kill 2>/dev/null
lsof -ti:3000 | xargs kill 2>/dev/null
```

## 常見問題

| 問題 | 解法 |
|------|------|
| ngrok 顯示 ERR_NGROK_108 | 免費方案同時只能開 1 個隧道，先關閉其他的 |
| 手機無法存取 | 確認 ngrok 是否有顯示警告頁（Visit Site 按鈕） |
| API 呼叫 CORS 錯誤 | 確認走 Vite proxy 或後端 CORS 設定已包含 ngrok 域名 |
| PWA 安裝提示未出現 | PWA 需 HTTPS（ngrok 已提供）+ valid manifest |
| 隧道速度慢 | 免費方案限速，可考慮升級或改用 Cloudflare Tunnel |
