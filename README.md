# BACKEND

# Công nghệ chính đã được sử dụng

```
Javascript, NodeJS, ExpressJs, MySql, Docker, Minio, Redis (cơ bản)

```

# Yêu cầu

```
Mã nguồn dự án đang chạy tốt với node version 21.7.1
Cần phải cài đặt trước Docker Desktop
Cần phải cài đặt ngrok (phục vụ cho các chức năng thanh toán online)

```

# Hướng dẫn cài đặt mã nguồn

```
cd existing_repo
git remote add origin https://github.com/huy090202/BACKEND.git
git branch -M main
git push -uf origin main

```

# Hướng dẫn khởi chạy mã nguồn

```
Di chuyển vào thư mục chứa mã nguồn: cd <tên thư mục mã nguồn>
Chạy lệnh cài đặt các package cần thiết: npm install
Tạo mới 1 file và đặt tên là .env
Sao chép nội dung trong file .env.example, dán những nội dung vừa sao chép vào .env
Tùy chỉnh lại các biến môi trường nếu cần (lưu ý cần chạy ngrok và thay đổi link trong biến môi trường để có thể thử nghiệm chức năng thanh toán online)
Mở docker desktop lên
Ở terminal của vs code, di chuyển vào thư mục docker: cd docker
Khởi chạy lệnh tạo các container của mã nguồn trong docker: docker compose -p luanvan_backend up --build -d

```
