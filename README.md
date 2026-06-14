# 🌾 Kế Hoạch Du Lịch Phú Yên & Đà Lạt 2026 - Hướng Dẫn Deploy Lên GitHub Pages

Chào bạn! Dưới đây là hướng dẫn chi tiết để sửa lỗi **404 (`main.tsx` không tải được)** khi bạn deploy ứng dụng này lên GitHub Pages.

---

## 🛠️ Nguyên Nhân Gặp Lỗi 404 `main.tsx` khi Deploy
Lỗi này xảy ra vì hiện tại trang GitHub Pages của bạn đang ở chế độ **Deploy from a branch** (chạy thủ công từ code thô trên nhánh `main` hoặc `master`). 
Do trình duyệt không thể đọc trực tiếp các tệp tin TypeScript (`.tsx`) thô ở thư mục gốc mà cần được biên dịch (build) trước qua Vite, trang web của bạn sẽ báo lỗi 404 hoặc lỗi Định dạng MIME (MIME type of "application/octet-stream").

---

## 🚀 Cách Sửa Lỗi Trong 3 Bước (Bằng GitHub Actions)

Ứng dụng của bạn đã kèm theo cấu hình tự động biên dịch và đăng tải cực kỳ tối ưu thông qua **GitHub Actions** tại đường dẫn `.github/workflows/deploy.yml`. 

Để kích hoạt tính năng tự phát hành trang web chuẩn chỉnh, hãy làm như sau:

1. **Truy cập vào Repository** của bạn trên GitHub.
2. Click vào tab **Settings** (Cài đặt) ở thanh công cụ phía trên trang chứa mã nguồn.
3. Ở menu bên trái, tìm và click vào danh mục **Pages** (dưới phần *Code and automation*).
4. Ở mục **Build and deployment** -> **Source**, hãy chuyển đổi giá trị:
   - Từ mặc định: **Deploy from a branch**
   - Sang: **GitHub Actions**
5. **Hoàn thành!** Mỗi khi bạn đẩy code mới lên nhánh `main`/`master`, GitHub sẽ tự chạy quy trình cài đặt, build thành trang web tĩnh siêu mượt và đẩy lên GitHub Pages của bạn hoàn toàn tự động.

---

## 🧭 Các Tính Năng Đã Tối Ưu Cho GitHub Pages

* **Chế Độ Tĩnh Thông Minh (Smart Static Mode):** Khi ứng dụng chạy trên tên miền `*.github.io` (GitHub Pages), hệ thống tự chuyển dịch sang lưu trữ toàn bộ dữ liệu (lịch trình du lịch Phú Yên mới, danh sách kiểm tra checklist, chỉnh sửa điểm đến) chạy 100% trong **LocalStorage** của trình duyệt. Bạn sẽ không lo bị lỗi thiếu Server hay API.
* **Kiểm Tra Quãng Đường (Distance Tracker):** Tích hợp kiểm tra khoảng cách thực giữa các điểm đến của chặng hành trình du lịch Phú Yên để bạn xếp lộ trình hợp lý nhất.
* **Giao Diện Hiện Đại & Responsive:** Tối ưu hóa mượt mà cho cả điện thoại (sử dụng lúc di chuyển ngoài suối, biển) lẫn máy tính.
