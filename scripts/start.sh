#!/bin/bash
# ============================================
# Vibe Money Book — 啟動腳本
# 啟動 Docker 容器 + Cloudflare Tunnel
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TUNNEL_CONFIG="$HOME/.cloudflared/config-moneybook.yml"
TUNNEL_NAME="vibe-money-book"
PID_FILE="$PROJECT_DIR/.tunnel.pid"

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# --------------------------------------------
# 1. 啟動 Docker 容器
# --------------------------------------------
echo ""
echo "=========================================="
echo "  Vibe Money Book — 啟動服務"
echo "=========================================="
echo ""

cd "$PROJECT_DIR"

info "啟動 Docker 容器..."
docker compose up -d --build

# 等待後端健康檢查
echo -n "  等待後端就緒"
for i in $(seq 1 30); do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        echo ""
        info "後端已就緒"
        break
    fi
    echo -n "."
    sleep 1
    if [ "$i" -eq 30 ]; then
        echo ""
        error "後端啟動逾時，請檢查 docker compose logs backend"
        exit 1
    fi
done

# 確認前端
if curl -sf http://localhost:80 > /dev/null 2>&1; then
    info "前端已就緒"
else
    error "前端未回應，請檢查 docker compose logs frontend"
    exit 1
fi

# --------------------------------------------
# 2. 啟動 Cloudflare Tunnel
# --------------------------------------------
if [ ! -f "$TUNNEL_CONFIG" ]; then
    error "找不到 Tunnel 設定檔：$TUNNEL_CONFIG"
    exit 1
fi

# 檢查是否已有 tunnel 在執行
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    warn "Tunnel 已在執行中 (PID: $(cat "$PID_FILE"))，跳過"
else
    info "啟動 Cloudflare Tunnel ($TUNNEL_NAME)..."
    cloudflared tunnel --config "$TUNNEL_CONFIG" run "$TUNNEL_NAME" > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    sleep 3

    if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        info "Tunnel 已啟動 (PID: $(cat "$PID_FILE"))"
    else
        error "Tunnel 啟動失敗"
        rm -f "$PID_FILE"
        exit 1
    fi
fi

# --------------------------------------------
# 3. 完成
# --------------------------------------------
echo ""
echo "=========================================="
info "所有服務已啟動！"
echo ""
echo "  前端：https://moneybook.smart-codings.com"
echo "  API ：https://moneybook-api.smart-codings.com"
echo "  本地：http://localhost (前端) / http://localhost:3000 (API)"
echo ""
echo "  停止服務：$(basename "$0" .sh) → scripts/stop.sh"
echo "=========================================="
