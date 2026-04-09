# 多帳號協作配置指南

本文件說明如何在 Vibe-SDLC 專案中配置多個 GitHub 帳號，讓不同的 Agent 或外部成員使用各自的帳號參與同一專案。

---

## 目錄

1. [場景概覽](#場景概覽)
2. [方式一：多人多機（各自登入）](#方式一多人多機各自登入)
3. [方式二：單機多 Agent（環境變數）](#方式二單機多-agent環境變數)
4. [方式三：GitHub App（自動化場景）](#方式三github-app自動化場景)
5. [Repo 權限配置](#repo-權限配置)
6. [Branch Protection Rules](#branch-protection-rules)
7. [.env 範例](#env-範例)
8. [常見問題](#常見問題)

---

## 場景概覽

| 場景 | 說明 | 推薦方式 |
|------|------|---------|
| 一人開發，單一帳號 | 所有角色共用同一 GitHub 帳號 | 不需額外配置 |
| 多人協作，各有帳號 | 每位成員在自己的機器上操作 | [方式一](#方式一多人多機各自登入) |
| 一台機器，模擬多角色 | 單人用多個帳號模擬團隊 | [方式二](#方式二單機多-agent環境變數) |
| CI/CD 自動化 | 自動化流程需要獨立身份 | [方式三](#方式三github-app自動化場景) |

---

## 方式一：多人多機（各自登入）

最簡單的方式。每位成員在自己的機器上登入自己的 GitHub 帳號。

### 步驟

#### 1. 成員登入自己的 GitHub 帳號

```bash
gh auth login
```

#### 2. 設定 Git 身份

```bash
git config --global user.name "Alice"
git config --global user.email "alice@example.com"
```

#### 3. Clone 專案並開始工作

```bash
git clone https://github.com/{owner}/{repo}.git
cd {repo}
```

#### 4. 啟動 Claude Code 並使用對應的 skill

```
/vibe-sdlc-dev
```

Claude Code 會自動使用當前 `gh auth` 登入的帳號進行 Issue 操作、PR 建立等。

### 注意事項

- 成員需要 Repo 的 Write 權限（Collaborator）或使用 Fork + PR 模式
- 每位成員的 commit 會自動帶上自己的 Git Author 身份
- PR 的作者會顯示為該成員的 GitHub 帳號

---

## 方式二：單機多 Agent（環境變數）

適用於一台機器上同時運行多個 Agent，每個 Agent 使用不同的 GitHub 帳號。

### 前置準備

為每個帳號建立 Personal Access Token (PAT)：

1. 前往 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 建立 Token，授予以下權限：
   - `repo`（完整 repo 存取）
   - `workflow`（如需操作 GitHub Actions）
3. 將 Token 存放在安全位置

### 步驟

#### 1. 建立 `.env` 檔案

在專案根目錄建立 `.env`（確保已加入 `.gitignore`）：

```bash
# .env — 嚴禁提交至版本控制！
GH_TOKEN_BACKEND=ghp_xxxxxxxxxxxxxxxxxxxx
GH_TOKEN_FRONTEND=ghp_yyyyyyyyyyyyyyyyyyyy
```

#### 2. 為每個 Agent 啟動獨立的 worktree

```bash
# A-Backend 的 worktree
git worktree add ../worktree-backend feat/backend/issue-12-auth-api
cd ../worktree-backend

# 設定此 worktree 的 Git 身份
git config --local user.name "Alice (A-Backend)"
git config --local user.email "alice@example.com"

# 設定此 session 的 GitHub Token
export GH_TOKEN=$GH_TOKEN_BACKEND
```

#### 3. 在該 worktree 中啟動 Claude Code

```bash
# 在 worktree 目錄中啟動
claude
```

此 session 中的所有 `gh` 命令和 `git commit` 都會使用對應的帳號身份。

### 快速切換腳本

可在專案中建立輔助腳本（不納入版本控制）：

```bash
#!/bin/bash
# scripts/switch-agent.sh （加入 .gitignore）
# 用法：source scripts/switch-agent.sh backend

AGENT=$1
source .env

case $AGENT in
  backend)
    export GH_TOKEN=$GH_TOKEN_BACKEND
    git config --local user.name "Alice (A-Backend)"
    git config --local user.email "alice@example.com"
    ;;
  frontend)
    export GH_TOKEN=$GH_TOKEN_FRONTEND
    git config --local user.name "Bob (A-Frontend)"
    git config --local user.email "bob@example.com"
    ;;
  *)
    echo "Unknown agent: $AGENT"
    return 1
    ;;
esac

echo "Switched to $AGENT — $(git config user.name) <$(git config user.email)>"
echo "GH_TOKEN: ${GH_TOKEN:0:10}..."
```

---

## 方式三：GitHub App（自動化場景）

適用於 CI/CD Pipeline 或定時自動化任務。

### 步驟

1. 在 GitHub → Settings → Developer settings → GitHub Apps 建立 App
2. 授予所需權限（Issues: Read & Write、Pull Requests: Read & Write、Contents: Read & Write）
3. 安裝 App 至目標 Repo
4. 使用 Installation Token 進行 API 操作

### 取得 Installation Token

```bash
# 使用 JWT 取得 Installation Token
# 需要 App ID 和 Private Key
JWT=$(ruby -e "require 'jwt'; payload = {iat: Time.now.to_i, exp: Time.now.to_i + 600, iss: ENV['APP_ID']}; puts JWT.encode(payload, OpenSSL::PKey::RSA.new(File.read(ENV['PRIVATE_KEY_PATH'])), 'RS256')")

INSTALLATION_TOKEN=$(curl -s -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/app/installations/{installation_id}/access_tokens" | jq -r .token)

export GH_TOKEN=$INSTALLATION_TOKEN
```

> **提示**：此方式較為複雜，建議僅在需要自動化身份（非真人帳號）時使用。

---

## Repo 權限配置

### 新增 Collaborator

透過 GitHub Web UI：

1. Repo → Settings → Collaborators and teams
2. 點擊「Add people」
3. 輸入成員的 GitHub 帳號
4. 選擇權限等級

透過 `gh` CLI：

```bash
# 邀請 Collaborator（需要 Admin 權限）
gh api repos/{owner}/{repo}/collaborators/{username} -X PUT -f permission=push
```

### 權限等級建議

| 角色 | 權限 | 說明 |
|------|------|------|
| H-Director | **Admin** | 完整管理權限，包含設定 Branch Protection |
| H-Reviewer | **Write** 或 **Maintain** | 可建立 PR、Review、合併 |
| 外部 AI Agent 操作者 | **Write** | 可 push 分支、建立 PR、操作 Issues |
| 唯讀觀察者 | **Read** | 僅可瀏覽，需透過 Fork + PR 貢獻 |

### Fork + PR 模式（最低權限）

若不想授予外部成員 Write 權限：

1. 外部成員 Fork 專案至自己的帳號
2. 在 Fork 中建立分支並開發
3. 向上游 Repo 提交 Pull Request
4. H-Director 審查並合併

> **注意**：Fork 模式下，`gh issue create` 等操作仍會在上游 Repo 執行（若有 Read 權限）。

---

## Branch Protection Rules

配合多帳號協作，建議設定以下保護規則：

### 透過 GitHub Web UI 設定

Repo → Settings → Branches → Add branch protection rule

### 建議規則（main 分支）

```
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   搜尋並勾選必要的 CI checks（如 build、test、lint）

✅ Require conversation resolution before merging

❌ Do not allow bypassing the above settings
   （即使 Admin 也必須遵守）
```

### 透過 `gh` CLI 設定

```bash
gh api repos/{owner}/{repo}/branches/main/protection -X PUT \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null
}
EOF
```

---

## .env 範例

在專案根目錄建立 `.env.example`（可納入版本控制，作為配置模板）：

```bash
# .env.example — 多帳號配置模板
# 複製為 .env 並填入實際值（.env 已加入 .gitignore）

# A-Backend Agent 的 GitHub PAT
GH_TOKEN_BACKEND=ghp_your_token_here

# A-Frontend Agent 的 GitHub PAT
GH_TOKEN_FRONTEND=ghp_your_token_here

# 若使用 GitHub App
# GITHUB_APP_ID=123456
# GITHUB_APP_PRIVATE_KEY_PATH=./private-key.pem
# GITHUB_APP_INSTALLATION_ID=789012
```

確認 `.gitignore` 包含：

```
.env
.env.*
!.env.example
```

---

## 常見問題

### Q: 多個帳號的 commit 會正確歸屬嗎？

是的。Git commit 的作者由 `git config user.name` 和 `user.email` 決定。只要每個 worktree 設定正確的 identity，commit 歷史會正確反映各作者。

### Q: PR 的作者是由什麼決定的？

PR 的作者由 `gh` CLI 當前認證的帳號決定（即 `GH_TOKEN` 或 `gh auth login` 的帳號）。

### Q: 外部成員離開專案後如何處理？

1. 在 Repo Settings → Collaborators 移除該成員
2. 撤銷對應的 PAT（若由你建立）
3. 更新 Dev Plan 的角色一覽表

### Q: 可以用同一帳號模擬不同角色嗎？

可以。只需在不同 worktree 設定不同的 `git config --local user.name`，commit 就會顯示不同的作者名稱。但 PR 的作者仍會是同一帳號。

### Q: 機器人帳號需要付費嗎？

GitHub Free plan 的 Collaborator 數量沒有限制（公開 Repo）。私有 Repo 在 Free plan 下最多 3 位 Collaborator，超過需要升級至 Team plan。
