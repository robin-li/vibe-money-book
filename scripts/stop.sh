#!/bin/bash
# ============================================
# Vibe Money Book — 停止腳本
# 停止 Cloudflare Tunnel + Docker 容器
# ============================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/.tunnel.pid"

GREEN='\033[0;32m'
NC='\033[0m'

info() { echo -e "${GREEN}[✓]${NC} $1"; }

echo ""
echo "=========================================="
echo "  Vibe Money Book — 停止服務"
echo "=========================================="
echo ""

# 停止 Tunnel
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        info "Tunnel 已停止 (PID: $PID)"
    fi
    rm -f "$PID_FILE"
else
    info "Tunnel 未執行"
fi

# 停止 Docker 容器
cd "$PROJECT_DIR"
docker compose down
info "Docker 容器已停止"

echo ""
info "所有服務已停止"
echo ""
