---
name: github-issue-delivery
description: Quy trình giao việc theo issue GitHub cho repo này — triển khai thay đổi, commit, push, rồi để lại comment tổng kết hoạt động trên issue trước khi đóng. Dùng khi được yêu cầu "làm issue", "làm hết issue", hoặc cập nhật tiến độ lên GitHub.
---

# Giao việc theo issue GitHub

Mỗi issue đi trọn một vòng: **làm → kiểm tra → commit → push → comment tổng kết → đóng**.
Không gộp nhiều issue vào một lần push, trừ khi người dùng yêu cầu rõ.

## 1. Đọc issue trước khi viết code

```bash
gh issue view <số> --json number,title,body,labels,url
```

Lấy đúng "Việc cần làm" và "Xong khi" trong body. Nếu tiêu chí mơ hồ, chọn cách hiểu
nhỏ nhất thoả "Xong khi" và ghi lại lựa chọn đó trong comment tổng kết.

## 2. Triển khai

- Bám convention sẵn có của repo (xem `styles.css`, các trang `.html`, cách đặt tên tiếng Việt không dấu).
- Không thêm dependency mới nếu HTML/CSS/JS thuần làm được.
- Giữ thay đổi đúng phạm vi issue; việc ngoài phạm vi thì mở issue mới, đừng nhét vào.

## 3. Kiểm tra tối thiểu

Chạy đúng mức cần cho thay đổi, ví dụ:

```bash
# HTML/JS: kiểm tra cú pháp script nội tuyến
node --check <tệp-js>
# Trang tĩnh: phục vụ thử rồi kiểm tra mã HTTP
python3 -m http.server 8000 &
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/<trang>.html
```

Ghi rõ trong comment cái gì **đã** kiểm và cái gì **chưa** kiểm được (ví dụ không có trình duyệt để xem giao diện).

## 4. Commit + push theo từng issue

Xem `git status` và `git diff` trước; chỉ stage tệp thuộc issue đang làm.

```bash
git add <các tệp của issue>
git commit -m "$(cat <<'EOF'
<Mô tả ngắn gọn mục đích thay đổi>

Closes #<số>
EOF
)"
git push
```

Repo này dùng GitHub Pages từ nhánh `main`, thư mục gốc — push là deploy.
Nếu người dùng chưa cho phép push, dừng lại và hỏi.

## 5. Comment tổng kết hoạt động trước khi đóng

Comment phải đọc được như một biên bản, không phải "đã xong". Mẫu:

```markdown
## Đã hoàn thành

- Tệp thay đổi: `a.html`, `styles.css`
- Nội dung chính: ...
- Commit: `<short hash>` — <tiêu đề commit>
- Đã kiểm: ...
- Chưa kiểm: ...

## Ghi chú

- Quyết định/lựa chọn thiết kế đáng biết (nếu có)
```

Đăng bằng heredoc để giữ markdown:

```bash
gh issue comment <số> --body-file - <<'EOF'
...
EOF
```

## 6. Đóng issue

```bash
gh issue close <số> --reason completed
```

Nếu chỉ hoàn thành một phần: giữ issue mở, comment phần còn lại và tách issue mới
cho phần chưa làm. Không đóng issue khi tiêu chí "Xong khi" chưa đạt.

## 7. Cập nhật note tổng hợp

Repo có issue ghi chú trạng thái được pin (xem `gh issue list --state all`). Sau khi
đóng issue, cập nhật bảng Done/Todo trong note đó bằng một comment ngắn hoặc sửa body:

```bash
gh issue edit <số-note> --body-file -
```

## Mẹo

- `gh issue list --state open` để biết còn gì; `gh issue view <số> --comments` để đọc lịch sử.
- Token thiếu scope `read:project` thì không dùng được Projects board; dùng issue đóng + label làm cột Done.
- Giữ mỗi commit gắn với đúng một issue qua dòng `Closes #<số>` để lịch sử tự liên kết.
