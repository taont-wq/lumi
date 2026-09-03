# 🚀 Hướng Dẫn Deploy Qua GitHub + Vercel

> Tài liệu này hướng dẫn deploy dự án **tra-cuu-can-ho-mau-noi-that-3d** (React + Vite + Tailwind v4 + TypeScript) lên Vercel thông qua GitHub, từ con số 0 đến production.

---

## 📋 Mục Lục

1. [Yêu cầu trước khi bắt đầu](#1-yêu-cầu-trước-khi-bắt-đầu)
2. [Khởi tạo Git & đẩy code lên GitHub](#2-khởi-tạo-git--đẩy-code-lên-github)
3. [Thiết lập biến môi trường (Environment Variables)](#3-thiết-lập-biến-môi-trường-environment-variables)
4. [Kết nối Vercel với GitHub](#4-kết-nối-vercel-với-github)
5. [Cấu hình Build trên Vercel](#5-cấu-hình-build-trên-vercel)
6. [Custom Domain (tuỳ chọn)](#6-custom-domain-tuỳ-chọn)
7. [CI/CD tự động](#7-cicd-tự-động)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Yêu cầu trước khi bắt đầu

- ✅ Tài khoản **GitHub** (https://github.com)
- ✅ Tài khoản **Vercel** (https://vercel.com) — đăng ký bằng GitHub cho nhanh
- ✅ **Git** đã cài trên máy (`git --version` để kiểm tra)
- ✅ **Node.js ≥ 18** (`node --version`)
- ✅ Project đã chạy thành công local với `npm run dev`
- ✅ File `.env.example` đã có sẵn các biến cần thiết

Kiểm tra nhanh:

```powershell
cd C:\Users\AD\.qwenpaw\workspaces\default\media\tra-cuu-can-ho-mau-noi-that-3d
git --version
node --version
npm --version
Test-Path .env.example
```

---

## 2. Khởi tạo Git & đẩy code lên GitHub

### Bước 2.1 — Tạo repo trên GitHub

1. Truy cập https://github.com/new
2. Điền:
   - **Repository name**: `tra-cuu-can-ho-mau-noi-that-3d` (hoặc tên tuỳ ý)
   - **Description**: `Landing page tra cứu căn hộ mẫu nội thất 3D`
   - **Visibility**: `Private` (khuyến nghị) hoặc `Public`
3. **KHÔNG** tick "Add a README file", "Add .gitignore", "Choose a license" (vì project đã có sẵn)
4. Nhấn **Create repository**
5. Copy URL repo (ví dụ: `https://github.com/your-username/tra-cuu-can-ho-mau-noi-that-3d.git`)

### Bước 2.2 — Khởi tạo git local

Mở terminal tại thư mục project và chạy:

```powershell
cd C:\Users\AD\.qwenpaw\workspaces\default\media\tra-cuu-can-ho-mau-noi-that-3d

# Khởi tạo git
git init

# Cấu hình user (chỉ cần làm 1 lần cho máy này)
git config --global user.name "Tên Của Bạn"
git config --global user.email "email@example.com"

# Thêm tất cả file (trừ những file trong .gitignore)
git add .

# Commit đầu tiên
git commit -m "feat: refactor AdminPortal + CatalogTreeManager, ready for deploy"

# Kết nối với GitHub repo vừa tạo
git remote add origin https://github.com/your-username/tra-cuu-can-ho-mau-noi-that-3d.git

# Đổi tên branch mặc định thành main (nếu cần)
git branch -M main

# Đẩy code lên GitHub
git push -u origin main
```

> 💡 Nếu dùng SSH thay HTTPS:
> ```powershell
> git remote add origin git@github.com:your-username/tra-cuu-can-ho-mau-noi-that-3d.git
> ```

### Bước 2.3 — Xác nhận đẩy thành công

Truy cập lại trang repo trên GitHub, bạn sẽ thấy:
- Tất cả file source code hiển thị
- Thư mục `node_modules/` **không** xuất hiện (đã bị .gitignore loại)
- Thư mục `dist/` **không** xuất hiện
- File `.env` **không** xuất hiện (nếu có — vì .gitignore loại `.env*`)

---

## 3. Thiết lập biến môi trường (Environment Variables)

### Bước 3.1 — File `.env.example` mẫu

Đảm bảo project có file `.env.example` (KHÔNG chứa giá trị thật, chỉ có key):

```bash
# .env.example — Copy thành .env và điền giá trị thật khi dev local
# Trên Vercel sẽ cấu hình trong Dashboard, KHÔNG push .env lên GitHub

# ===== Google Gemini API (dùng cho AI features) =====
GEMINI_API_KEY=your-gemini-api-key-here

# ===== Google Apps Script Webhook (lưu lead vào Google Sheet) =====
GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# ===== Facebook Graph API (nếu dùng module social) =====
FACEBOOK_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
```

### Bước 3.2 — Kiểm tra code đọc biến môi trường đúng cách

Vite yêu cầu biến môi trường phải có tiền tố `VITE_` mới expose ra client:

```typescript
// src/services/geminiService.ts (ví dụ)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// hoặc
const apiKey = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL;
```

Nếu bạn dùng tên biến không có `VITE_` (ví dụ `GEMINI_API_KEY`), phải đổi tên thành `VITE_GEMINI_API_KEY` để Vite nhận diện được.

> ⚠️ **Cảnh báo bảo mật**: Tất cả biến `VITE_*` sẽ được **bundle vào file JS** trên client. Không bao giờ đặt secret thật (như API key quản trị) vào biến `VITE_*` — chỉ đặt những key an toàn để lộ public.

### Bước 3.3 — Cấu hình biến trên Vercel (làm SAU khi import project)

Xem **Bước 5.3** bên dưới.

---

## 4. Kết nối Vercel với GitHub

### Bước 4.1 — Đăng nhập Vercel

1. Truy cập https://vercel.com
2. Nhấn **Sign Up** hoặc **Log In**
3. Chọn **Continue with GitHub**
4. Cho phép Vercel truy cập GitHub account của bạn

### Bước 4.2 — Import project từ GitHub

1. Tại Dashboard Vercel, nhấn **Add New…** → **Project**
2. Trong mục **Import Git Repository**, tìm repo `tra-cuu-can-ho-mau-noi-that-3d`
3. Nhấn **Import** bên cạnh repo đó

> 💡 Nếu không thấy repo: nhấn **Configure GitHub App** → chọn **All repositories** hoặc chỉ định repo cụ thể.

### Bước 4.3 — Cấu hình Project trên Vercel

Trong trang **Configure Project**:

| Trường | Giá trị khuyến nghị |
|---|---|
| **Project Name** | `tra-cuu-can-ho-mau-noi-that-3d` (sẽ thành subdomain `*.vercel.app`) |
| **Framework Preset** | `Vite` (Vercel tự nhận diện) |
| **Root Directory** | `./` (mặc định) |
| **Build Command** | `npm run build` (mặc định) |
| **Output Directory** | `dist` (mặc định cho Vite) |
| **Install Command** | `npm install` (mặc định) |

### Bước 4.4 — Thêm Environment Variables

Mở rộng mục **Environment Variables** và điền:

| Name | Value | Environment |
|---|---|---|
| `VITE_GEMINI_API_KEY` | `AIzaSy...` (key thật) | Production, Preview, Development |
| `VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | `https://script.google.com/.../exec` | Production, Preview, Development |
| `VITE_FACEBOOK_ACCESS_TOKEN` | (nếu cần) | Production |
| `VITE_FACEBOOK_PAGE_ID` | (nếu cần) | Production |

> 💡 Tick cả 3 môi trường (Production, Preview, Development) để mỗi lần push nhánh mới đều có biến.

### Bước 4.5 — Deploy lần đầu

Nhấn **Deploy**. Vercel sẽ:

1. ⏳ Clone repo
2. 📦 Chạy `npm install`
3. 🔨 Chạy `npm run build` (khoảng 1–2 phút)
4. 🚀 Deploy lên edge network

Sau khi xong, Vercel sẽ cấp URL dạng:
```
https://tra-cuu-can-ho-mau-noi-that-3d.vercel.app
```

Nhấn **Visit** để mở site vừa deploy. ✨

---

## 5. Cấu hình Build trên Vercel

### Bước 5.1 — File `vercel.json` (khuyến nghị)

Tạo file `vercel.json` ở thư mục gốc project để control routing & headers:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Giải thích:
- `rewrites`: SPA routing — mọi URL đều trỏ về `index.html` (cho React Router nếu dùng)
- `headers`: Cache tĩnh 1 năm cho file trong `/assets/`

### Bước 5.2 — Kiểm tra Build Settings

Vào **Project Settings** → **General** → **Build & Development Settings**:

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Development Command | `npm run dev` |

### Bước 5.3 — Quản lý Environment Variables sau khi deploy

Vào **Project Settings** → **Environment Variables**:

- Thêm biến mới ➕
- Sửa biến hiện tại ✏️
- Xoá biến ➖

> ⚠️ Sau khi sửa biến môi trường, **phải redeploy** để có hiệu lực:
> Vào tab **Deployments** → nhấn ⋯ bên cạnh deployment gần nhất → **Redeploy**.

### Bước 5.4 — Cấu hình Node.js Version

Vercel mặc định dùng Node 20. Nếu cần pin version cụ thể, thêm vào `package.json`:

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

Hoặc tạo file `.nvmrc` ở thư mục gốc:
```
20
```

---

## 6. Custom Domain (tuỳ chọn)

### Bước 6.1 — Mua domain (nếu chưa có)

- **Tại Việt Nam**: Mua tại `PA Vietnam`, `VNPT`, `MatBao`...
- **Quốc tế**: `Namecheap`, `Cloudflare Registrar`, `Google Domains`

### Bước 6.2 — Thêm domain trên Vercel

1. Vào **Project Settings** → **Domains**
2. Nhập domain của bạn (vd: `canhomau.vn` hoặc `www.canhomau.vn`)
3. Nhấn **Add**

Vercel sẽ hướng dẫn thêm DNS record. Ví dụ với domain mua ở Cloudflare:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

### Bước 6.3 — Đợi DNS propagate

- Thường 5–30 phút, tối đa 24h
- Kiểm tra: `nslookup canhomau.vn` hoặc https://dnschecker.org

---

## 7. CI/CD tự động

### Tự động deploy theo nhánh

Vercel **mặc định** đã thiết lập sẵn:

| Nhánh Git | Môi trường | URL |
|---|---|---|
| `main` (hoặc `master`) | **Production** | `https://your-project.vercel.app` |
| Mọi nhánh khác | **Preview** | `https://your-project-git-<branch>-username.vercel.app` |
| Mỗi Pull Request | **Preview** (URL riêng) | comment trong PR |

### Quy trình làm việc hàng ngày

```powershell
# Tạo nhánh mới cho mỗi feature
git checkout -b feature/chat-ai

# Sửa code, test local
npm run dev
npm run build

# Commit & push
git add .
git commit -m "feat: thêm chat AI tư vấn"
git push origin feature/chat-ai

# Tạo Pull Request trên GitHub
# → Vercel tự động tạo Preview URL

# Sau khi review OK, merge vào main
# → Vercel tự động deploy lên Production
```

### Rollback nhanh

Nếu deploy mới bị lỗi:

1. Vào **Deployments** trên Vercel
2. Tìm deployment cũ vẫn chạy tốt
3. Nhấn ⋯ → **Promote to Production**

Rollback chỉ mất **~10 giây**, không cần sửa code.

---

## 8. Troubleshooting

### ❌ Lỗi: `Build failed - Cannot find module 'X'`

**Nguyên nhân**: Thiếu dependency trong `package.json`.

**Cách sửa**:
```powershell
npm install X
git add package.json package-lock.json
git commit -m "chore: add missing dependency"
git push
```

### ❌ Lỗi: `Environment variable not found` lúc runtime

**Nguyên nhân**: Chưa thêm biến trên Vercel Dashboard.

**Cách sửa**:
1. Vào **Project Settings** → **Environment Variables**
2. Thêm biến còn thiếu
3. **Redeploy** (tab Deployments → ⋯ → Redeploy)

### ❌ Lỗi: `TS2304: Cannot find name 'X'`

**Nguyên nhân**: TypeScript compile lỗi. Chạy local trước:
```powershell
npm run lint  # = tsc --noEmit
```
Sửa hết lỗi, commit, push lại.

### ❌ Site trắng trang / 404 khi refresh

**Nguyên nhân**: SPA routing chưa được cấu hình. Cần `vercel.json` rewrites.

**Cách sửa**: Thêm file `vercel.json` (xem Bước 5.1).

### ❌ Hình ảnh / assets không load

**Nguyên nhân**: Đường dẫn tuyệt đối `/assets/...` không đúng với base path.

**Cách sửa**: Trong `vite.config.ts`, đảm bảo:
```typescript
export default defineConfig({
  base: '/',  // hoặc '/ten-sub-path/' nếu deploy vào sub-path
  // ...
});
```

### ❌ Quên mật khẩu admin (mặc định `admin123`)

Sau khi deploy, tài khoản admin lưu trong `localStorage` của trình duyệt. Để reset:

1. Mở site trên trình duyệt
2. F12 → tab **Application** → **Local Storage**
3. Xoá các key liên quan: `adminSession`, `adminPasswordHash`, ...
4. Refresh — mật khẩu sẽ reset về `admin123` (theo `DEFAULT_ADMIN_HASH` trong `authService.ts`)

---

## 📚 Tài liệu tham khảo

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deploy Guide**: https://vitejs.dev/guide/static-deploy.html#vercel
- **GitHub Actions for Vercel**: https://github.com/marketplace/actions/vercel-action
- **Vercel CLI** (tuỳ chọn, dùng khi không muốn qua Dashboard):
  ```powershell
  npm i -g vercel
  vercel login
  vercel        # deploy preview
  vercel --prod # deploy production
  ```

---

## ✅ Checklist triển khai

- [ ] Repo đã tạo trên GitHub
- [ ] Code đã push lên GitHub
- [ ] File `.gitignore` loại trừ `node_modules/`, `dist/`, `.env*`
- [ ] File `.env.example` có sẵn tất cả key cần thiết
- [ ] Tất cả biến môi trường đã có tiền tố `VITE_` (nếu dùng ở client)
- [ ] `npm run build` chạy thành công local
- [ ] `npm run lint` (= `tsc --noEmit`) pass 0 lỗi
- [ ] Đã tạo project trên Vercel và import từ GitHub
- [ ] Đã thêm Environment Variables trên Vercel
- [ ] Deploy đầu tiên thành công, site live tại `*.vercel.app`
- [ ] (Tuỳ chọn) Đã cấu hình custom domain
- [ ] Đã test workflow: push nhánh mới → preview URL tự sinh → merge → production update

---

**Tác giả**: Refactor & viết hướng dẫn bởi MiniMax · Cập nhật: 2026-09-03
