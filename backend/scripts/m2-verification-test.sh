#!/bin/bash
# ============================================================
# M2 驗證整合測試腳本
# 覆蓋 Issue #24 (LLM 引擎整合), #26 (完整記帳流程), #27 (新類別偵測)
# ============================================================

set -eo pipefail

# ─── 配置 ─────────────────────────────────────────────────
BASE_URL="http://localhost:3001/api/v1"
GEMINI_KEY="${GEMINI_API_KEY:-}"
OPENAI_KEY="${OPENAI_API_KEY:-}"
TEST_DB="file:./test-m2-verification.db"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_FILE="$BACKEND_DIR/scripts/m2-verification-results.txt"
SERVER_PID=""
TOKEN=""
TODAY=$(date '+%Y-%m-%d')

# 計數器
PASS=0
FAIL=0
SKIP=0

# ─── 工具函數 ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()     { echo -e "${CYAN}[INFO]${NC} $1"; }
pass()    { echo -e "${GREEN}[PASS]${NC} $1"; PASS=$((PASS+1)); echo "PASS: $1" >> "$RESULTS_FILE"; }
fail()    { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL+1)); echo "FAIL: $1" >> "$RESULTS_FILE"; }
skip()    { echo -e "${YELLOW}[SKIP]${NC} $1"; SKIP=$((SKIP+1)); echo "SKIP: $1" >> "$RESULTS_FILE"; }
section() { echo -e "\n${CYAN}════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════════════${NC}"; }

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    log "停止測試伺服器 (PID: $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$BACKEND_DIR/prisma/test-m2-verification.db" "$BACKEND_DIR/prisma/test-m2-verification.db-journal"
  log "已清理測試資源"
}
trap cleanup EXIT

# curl helper
api_call() {
  local method="$1" endpoint="$2" data="${3:-}" extra_header="${4:-}"
  local -a args=(-s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" -H "Content-Type: application/json")
  [ -n "$TOKEN" ] && args+=(-H "Authorization: Bearer $TOKEN")
  [ -n "$extra_header" ] && args+=(-H "$extra_header")
  [ -n "$data" ] && args+=(-d "$data")
  curl --max-time 30 "${args[@]}" 2>/dev/null
}

get_status() { echo "$1" | tail -1; }
get_body()   { echo "$1" | sed '$d'; }

json_get() {
  echo "$1" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      try{const o=JSON.parse(d);const v=$2;
        process.stdout.write(v===undefined||v===null?'null':String(v))
      }catch(e){process.stdout.write('ERROR')}
    })"
}

# 測試單一 AI 解析案例
test_parse() {
  local label="$1" input="$2" api_key="$3" expected_amt="$4"
  local resp status body amount category merchant confidence feedback emotion

  resp=$(api_call POST "/ai/parse" "{\"raw_text\":\"$input\"}" "X-LLM-API-Key: $api_key")
  status=$(get_status "$resp")
  body=$(get_body "$resp")

  if [ "$status" != "200" ]; then
    fail "$label 「$input」→ HTTP $status"
    local err_msg
    err_msg=$(json_get "$body" "o.message")
    echo "    錯誤: $err_msg"
    return 1
  fi

  amount=$(json_get "$body" "o.data.parsed.amount")
  category=$(json_get "$body" "o.data.parsed.category")
  merchant=$(json_get "$body" "o.data.parsed.merchant")
  confidence=$(json_get "$body" "o.data.parsed.confidence")
  feedback=$(json_get "$body" "o.data.feedback.text")
  emotion=$(json_get "$body" "o.data.feedback.emotion_tag")

  # 結構完整性
  local struct_ok=true
  [ "$amount" = "ERROR" ] && struct_ok=false
  [ "$category" = "ERROR" ] && struct_ok=false
  if [ -z "$feedback" ] || [ "$feedback" = "ERROR" ] || [ "$feedback" = "null" ]; then
    struct_ok=false
  fi

  # 金額驗證
  local amt_ok=true
  if [ -n "$expected_amt" ] && [ "$amount" != "$expected_amt" ]; then
    amt_ok=false
  fi

  if $struct_ok && $amt_ok; then
    pass "$label 「$input」→ $amount 元, $category, $merchant (confidence=$confidence)"
    echo "    💬 $feedback ($emotion)"
    return 0
  else
    fail "$label 「$input」→ amount=$amount(期望:${expected_amt:-any}), cat=$category, struct_ok=$struct_ok"
    echo "    💬 $feedback ($emotion)"
    return 1
  fi
}

# ─── 啟動測試環境 ──────────────────────────────────────────
section "啟動測試環境"

if [ -z "$GEMINI_KEY" ]; then
  echo "請設定 GEMINI_API_KEY 環境變數"; exit 1
fi

cd "$BACKEND_DIR"

log "建立測試資料庫..."
DATABASE_URL="$TEST_DB" npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1 | tail -3

log "啟動測試伺服器 (port 3001)..."
DATABASE_URL="$TEST_DB" API_PORT=3001 NODE_ENV=test npx tsx src/server.ts &
SERVER_PID=$!

for i in $(seq 1 15); do
  if curl -s "http://localhost:3001/health" >/dev/null 2>&1; then
    log "伺服器已啟動 (PID: $SERVER_PID)"
    break
  fi
  [ "$i" -eq 15 ] && { echo "伺服器啟動超時"; exit 1; }
  sleep 1
done

echo "M2 驗證測試結果 - $(date '+%Y-%m-%d %H:%M:%S')" > "$RESULTS_FILE"
echo "=================================================" >> "$RESULTS_FILE"

# ─── 註冊測試用戶 ──────────────────────────────────────────
section "準備：註冊測試用戶"

RESP=$(api_call POST "/auth/register" '{"name":"M2 Tester","email":"m2test@test.com","password":"testpass123"}')
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")

if [ "$STATUS" = "201" ]; then
  TOKEN=$(json_get "$BODY" "o.data.token")
  log "註冊成功，已取得 Token"
else
  echo "註冊失敗: $BODY"; exit 1
fi

# ============================================================
# Issue #24：Gemini/OpenAI 引擎整合測試
# ============================================================
section "Issue #24：LLM 引擎整合測試"

echo ""
log "▶ 測試 Gemini 引擎（5 組案例）"
GEMINI_PASS=0

test_parse "#24-Gemini[1]" "午餐吃拉麵 180 元"          "$GEMINI_KEY" "180" && GEMINI_PASS=$((GEMINI_PASS+1)) || true
test_parse "#24-Gemini[2]" "搭捷運去公司 32 元"          "$GEMINI_KEY" "32"  && GEMINI_PASS=$((GEMINI_PASS+1)) || true
test_parse "#24-Gemini[3]" "買了一杯星巴克拿鐵"          "$GEMINI_KEY" ""    && GEMINI_PASS=$((GEMINI_PASS+1)) || true
test_parse "#24-Gemini[4]" "幫朋友付了晚餐錢大概兩千多"  "$GEMINI_KEY" ""    && GEMINI_PASS=$((GEMINI_PASS+1)) || true
test_parse "#24-Gemini[5]" "看了一場電影"                "$GEMINI_KEY" ""    && GEMINI_PASS=$((GEMINI_PASS+1)) || true

echo ""
if [ "$GEMINI_PASS" -ge 4 ]; then
  pass "#24-Gemini 通過標準: $GEMINI_PASS/5 ≥ 4/5 ✓"
else
  fail "#24-Gemini 通過標準: $GEMINI_PASS/5 < 4/5 ✗"
fi

# ─── OpenAI 引擎測試 ──────────────────────────────────────
echo ""
if [ -n "$OPENAI_KEY" ]; then
  log "▶ 測試 OpenAI 引擎（切換用戶引擎設定）"

  RESP=$(api_call PUT "/users/profile" '{"ai_engine":"openai"}')
  if [ "$(get_status "$RESP")" != "200" ]; then
    fail "#24-OpenAI 切換引擎失敗"
  else
    OPENAI_PASS=0

    test_parse "#24-OpenAI[1]" "午餐吃拉麵 180 元"          "$OPENAI_KEY" "180" && OPENAI_PASS=$((OPENAI_PASS+1)) || true
    test_parse "#24-OpenAI[2]" "搭捷運去公司 32 元"          "$OPENAI_KEY" "32"  && OPENAI_PASS=$((OPENAI_PASS+1)) || true
    test_parse "#24-OpenAI[3]" "買了一杯星巴克拿鐵"          "$OPENAI_KEY" ""    && OPENAI_PASS=$((OPENAI_PASS+1)) || true
    test_parse "#24-OpenAI[4]" "幫朋友付了晚餐錢大概兩千多"  "$OPENAI_KEY" ""    && OPENAI_PASS=$((OPENAI_PASS+1)) || true
    test_parse "#24-OpenAI[5]" "看了一場電影"                "$OPENAI_KEY" ""    && OPENAI_PASS=$((OPENAI_PASS+1)) || true

    echo ""
    if [ "$OPENAI_PASS" -ge 4 ]; then
      pass "#24-OpenAI 通過標準: $OPENAI_PASS/5 ≥ 4/5 ✓"
    else
      fail "#24-OpenAI 通過標準: $OPENAI_PASS/5 < 4/5 ✗"
    fi

    # 切回 gemini
    api_call PUT "/users/profile" '{"ai_engine":"gemini"}' > /dev/null
  fi
else
  skip "#24-OpenAI 測試（未提供 OPENAI_API_KEY）"
fi

# ─── 人設風格測試 ──────────────────────────────────────────
echo ""
log "▶ 測試三種人設風格"

for PERSONA in sarcastic gentle guilt_trip; do
  RESP=$(api_call PUT "/users/profile" "{\"persona\":\"$PERSONA\"}")
  if [ "$(get_status "$RESP")" != "200" ]; then
    fail "#24-人設[$PERSONA] 切換失敗"
    continue
  fi

  RESP=$(api_call POST "/ai/parse" '{"raw_text":"喝了一杯 200 元的手搖飲"}' "X-LLM-API-Key: $GEMINI_KEY")
  STATUS=$(get_status "$RESP")
  BODY=$(get_body "$RESP")

  if [ "$STATUS" = "200" ]; then
    FEEDBACK=$(json_get "$BODY" "o.data.feedback.text")
    EMOTION=$(json_get "$BODY" "o.data.feedback.emotion_tag")
    if [ -n "$FEEDBACK" ] && [ "$FEEDBACK" != "null" ] && [ "$FEEDBACK" != "ERROR" ]; then
      pass "#24-人設[$PERSONA] 回饋正常"
      echo "    💬 $FEEDBACK ($EMOTION)"
    else
      fail "#24-人設[$PERSONA] 回饋為空"
    fi
  else
    fail "#24-人設[$PERSONA] 解析失敗: HTTP $STATUS"
  fi
done

# 恢復為 gentle
api_call PUT "/users/profile" '{"persona":"gentle"}' > /dev/null

# ============================================================
# Issue #26：完整記帳流程（文字輸入）
# ============================================================
section "Issue #26：完整記帳流程驗證"

log "▶ 步驟 1/4：文字輸入 → AI 解析"
RESP=$(api_call POST "/ai/parse" '{"raw_text":"午餐吃了滷肉飯 85 元"}' "X-LLM-API-Key: $GEMINI_KEY")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")

PARSED_AMOUNT="85"
PARSED_CAT="food"
PARSED_MERCHANT="滷肉飯店"
FEEDBACK_TEXT=""
FEEDBACK_EMOTION=""

if [ "$STATUS" = "200" ]; then
  PARSED_AMOUNT=$(json_get "$BODY" "o.data.parsed.amount")
  PARSED_CAT=$(json_get "$BODY" "o.data.parsed.category")
  PARSED_MERCHANT=$(json_get "$BODY" "o.data.parsed.merchant")
  PARSED_DATE=$(json_get "$BODY" "o.data.parsed.date")
  FEEDBACK_TEXT=$(json_get "$BODY" "o.data.feedback.text")
  FEEDBACK_EMOTION=$(json_get "$BODY" "o.data.feedback.emotion_tag")
  BUDGET_REMAINING=$(json_get "$BODY" "o.data.budget_context.remaining")

  pass "#26-解析 文字輸入解析成功: $PARSED_AMOUNT 元, $PARSED_CAT, $PARSED_MERCHANT"
  echo "    📊 預算剩餘: $BUDGET_REMAINING 元"
  echo "    💬 AI 回饋: $FEEDBACK_TEXT"
else
  fail "#26-解析 文字輸入解析失敗: HTTP $STATUS"
fi

log "▶ 步驟 2/4：確認並儲存交易"
# 清理 feedback text 中的特殊字元，避免 JSON 解析問題
SAFE_FEEDBACK=$(echo "$FEEDBACK_TEXT" | sed 's/"/\\"/g' | tr -d '\n')

RESP=$(api_call POST "/transactions" "{
  \"amount\": $PARSED_AMOUNT,
  \"category\": \"$PARSED_CAT\",
  \"merchant\": \"$PARSED_MERCHANT\",
  \"raw_text\": \"午餐吃了滷肉飯 85 元\",
  \"transaction_date\": \"$TODAY\",
  \"feedback\": {
    \"text\": \"$SAFE_FEEDBACK\",
    \"emotion_tag\": \"$FEEDBACK_EMOTION\",
    \"persona_used\": \"gentle\"
  }
}")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
TX_ID=""

if [ "$STATUS" = "201" ]; then
  TX_ID=$(json_get "$BODY" "o.data.transaction.id")
  TX_AMOUNT=$(json_get "$BODY" "o.data.transaction.amount")
  HAS_FEEDBACK=$(json_get "$BODY" "o.data.feedback.feedback_text")
  pass "#26-儲存 交易建立成功 (ID: ${TX_ID:0:8}..., 金額: $TX_AMOUNT)"
  if [ -n "$HAS_FEEDBACK" ] && [ "$HAS_FEEDBACK" != "null" ]; then
    pass "#26-回饋 AI 人設評論已儲存"
  else
    fail "#26-回饋 AI 人設評論未儲存"
  fi
else
  fail "#26-儲存 交易建立失敗: HTTP $STATUS"
  echo "    $(get_body "$RESP")"
fi

log "▶ 步驟 3/4：查詢已儲存交易"
if [ -n "$TX_ID" ]; then
  RESP=$(api_call GET "/transactions/$TX_ID")
  STATUS=$(get_status "$RESP")
  BODY=$(get_body "$RESP")

  if [ "$STATUS" = "200" ]; then
    SAVED_AMOUNT=$(json_get "$BODY" "o.data.amount")
    SAVED_CAT=$(json_get "$BODY" "o.data.category")
    SAVED_FEEDBACK=$(json_get "$BODY" "o.data.feedback.feedback_text")
    if [ "$SAVED_AMOUNT" = "$PARSED_AMOUNT" ]; then
      pass "#26-查詢 交易資料正確: $SAVED_AMOUNT 元, $SAVED_CAT"
    else
      fail "#26-查詢 金額不一致: 期望 $PARSED_AMOUNT, 實際 $SAVED_AMOUNT"
    fi
    if [ -n "$SAVED_FEEDBACK" ] && [ "$SAVED_FEEDBACK" != "null" ]; then
      pass "#26-回顯 AI 回饋可回顯"
    else
      fail "#26-回顯 AI 回饋無法回顯"
    fi
  else
    fail "#26-查詢 交易查詢失敗: HTTP $STATUS"
  fi
fi

log "▶ 步驟 4/4：驗證最近帳目列表更新"
RESP=$(api_call GET "/transactions?page=1&limit=5")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")

if [ "$STATUS" = "200" ]; then
  TOTAL=$(json_get "$BODY" "o.data.pagination.total")
  if [ "$TOTAL" -gt 0 ] 2>/dev/null; then
    pass "#26-列表 最近帳目列表有 $TOTAL 筆記錄"
  else
    fail "#26-列表 最近帳目列表為空"
  fi
else
  fail "#26-列表 查詢失敗: HTTP $STATUS"
fi

# ============================================================
# Issue #27：新類別偵測確認流程
# ============================================================
section "Issue #27：新類別偵測確認流程"

log "▶ 步驟 1/3：送出未知類別的記帳語句"
RESP=$(api_call POST "/ai/parse" '{"raw_text":"寵物美容洗澡 800 元"}' "X-LLM-API-Key: $GEMINI_KEY")
STATUS=$(get_status "$RESP")
BODY=$(get_body "$RESP")
SUGGESTED=""
NEW_AMT="800"

if [ "$STATUS" = "200" ]; then
  IS_NEW=$(json_get "$BODY" "o.data.parsed.is_new_category")
  SUGGESTED=$(json_get "$BODY" "o.data.parsed.suggested_category")
  NEW_CAT=$(json_get "$BODY" "o.data.parsed.category")
  NEW_AMT=$(json_get "$BODY" "o.data.parsed.amount")

  echo "    is_new_category=$IS_NEW, suggested=$SUGGESTED, category=$NEW_CAT, amount=$NEW_AMT"

  if [ "$IS_NEW" = "true" ]; then
    pass "#27-偵測 新類別偵測觸發成功 (suggested: $SUGGESTED)"
  else
    echo "    ⚠️  「寵物美容」未觸發新類別，嘗試「插花課程 600 元」..."

    RESP2=$(api_call POST "/ai/parse" '{"raw_text":"插花課程 600 元"}' "X-LLM-API-Key: $GEMINI_KEY")
    if [ "$(get_status "$RESP2")" = "200" ]; then
      BODY2=$(get_body "$RESP2")
      IS_NEW2=$(json_get "$BODY2" "o.data.parsed.is_new_category")
      SUGGESTED2=$(json_get "$BODY2" "o.data.parsed.suggested_category")
      echo "    retry: is_new_category=$IS_NEW2, suggested=$SUGGESTED2"

      if [ "$IS_NEW2" = "true" ]; then
        pass "#27-偵測 新類別偵測觸發成功 (suggested: $SUGGESTED2)"
        SUGGESTED="$SUGGESTED2"
        NEW_AMT="600"
      else
        # LLM 可能把所有東西歸到現有類別，這不算 bug，但要記錄
        fail "#27-偵測 新類別偵測未觸發 (LLM 將所有輸入歸入現有類別)"
      fi
    fi
  fi
else
  fail "#27-偵測 AI 解析失敗: HTTP $STATUS"
fi

log "▶ 步驟 2/3：模擬「確認新增」→ 用新類別儲存交易"
CUSTOM_CAT="${SUGGESTED:-pet_grooming}"
[ "$CUSTOM_CAT" = "null" ] && CUSTOM_CAT="pet_grooming"

RESP=$(api_call POST "/transactions" "{
  \"amount\": $NEW_AMT,
  \"category\": \"$CUSTOM_CAT\",
  \"merchant\": \"寵物美容店\",
  \"raw_text\": \"寵物美容洗澡 800 元\",
  \"transaction_date\": \"$TODAY\"
}")
STATUS=$(get_status "$RESP")

if [ "$(get_status "$RESP")" = "201" ]; then
  BODY=$(get_body "$RESP")
  TX_CAT2=$(json_get "$BODY" "o.data.transaction.category")
  pass "#27-新增 自訂類別交易儲存成功 (category: $TX_CAT2)"
else
  fail "#27-新增 自訂類別交易儲存失敗: HTTP $(get_status "$RESP")"
fi

log "▶ 步驟 3/3：模擬「選擇現有類別」→ 歸入 other"
RESP=$(api_call POST "/transactions" "{
  \"amount\": 800,
  \"category\": \"other\",
  \"merchant\": \"寵物美容店\",
  \"raw_text\": \"寵物美容洗澡（歸類至其他）\",
  \"transaction_date\": \"$TODAY\"
}")

if [ "$(get_status "$RESP")" = "201" ]; then
  pass "#27-歸類 選擇現有類別(other)儲存成功"
else
  fail "#27-歸類 選擇現有類別儲存失敗"
fi

# ─── 刪除驗證 ─────────────────────────────────────────────
echo ""
log "▶ 附加：測試交易刪除 (cascade)"
if [ -n "$TX_ID" ]; then
  RESP=$(api_call DELETE "/transactions/$TX_ID")
  if [ "$(get_status "$RESP")" = "204" ]; then
    pass "#26-刪除 交易刪除成功 (含 cascade 刪除 AI Feedback)"
  else
    fail "#26-刪除 交易刪除失敗: HTTP $(get_status "$RESP")"
  fi

  # 確認已刪除
  RESP=$(api_call GET "/transactions/$TX_ID")
  if [ "$(get_status "$RESP")" = "404" ]; then
    pass "#26-刪除 已刪除交易查詢回傳 404"
  else
    fail "#26-刪除 已刪除交易仍可查詢"
  fi
fi

# ============================================================
# 總結報告
# ============================================================
section "測試結果總結"

echo "" >> "$RESULTS_FILE"
echo "=================================================" >> "$RESULTS_FILE"
echo "PASS: $PASS  FAIL: $FAIL  SKIP: $SKIP" >> "$RESULTS_FILE"

echo ""
echo -e "  ${GREEN}✅ 通過: $PASS${NC}"
echo -e "  ${RED}❌ 失敗: $FAIL${NC}"
echo -e "  ${YELLOW}⏭️  跳過: $SKIP${NC}"
echo ""

echo "  覆蓋範圍："
echo "  ├─ #24：Gemini 引擎 5 案例 + OpenAI 引擎 5 案例 + 3 種人設風格"
echo "  ├─ #26：文字輸入→解析→確認儲存→查詢→列表→刪除（後端全流程）"
echo "  └─ #27：新類別偵測→自訂類別儲存→選擇現有類別歸類"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}🎉 所有測試通過！${NC}"
else
  echo -e "  ${RED}⚠️  有 $FAIL 項測試失敗，請檢查上方細節${NC}"
fi

echo ""
log "完整結果已寫入: $RESULTS_FILE"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
