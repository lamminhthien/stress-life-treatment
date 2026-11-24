# stress-life-treatment

Một trang tĩnh nhỏ gọn, dịu mắt về bốn cách hạ nhiệt khi áp lực đè nặng:
xem ảnh, câu nói "hãm phanh", âm nhạc và đọc sách.

## Nội dung

- `index.html` — toàn bộ nội dung trang
- `album.html` — album "Reset": 30 ảnh thư giãn chia 3 nhóm cảm xúc
- `gallery.html` — chế độ trình chiếu toàn màn hình, chạy ảnh cùng nhạc nền
- `audio/` — 3 bản nhạc ambient/piano, giấy phép CC0
- `images/` — 30 ảnh, giấy phép CC0 (nguồn ghi trong `CREDITS.md`)
- `styles.css` — giao diện, responsive cho điện thoại

## Chạy thử tại máy

Mở trực tiếp `index.html`, hoặc:

```bash
python3 -m http.server 8000
```

rồi vào http://localhost:8000

## Triển khai

Trang được phục vụ bằng GitHub Pages từ nhánh `main`, thư mục gốc.

## Ảnh

30 ảnh trong album được tìm qua [Openverse](https://openverse.org), đều ở giấy phép
CC0 1.0 (phạm vi công cộng). Danh sách tác giả và link nguồn: [`CREDITS.md`](CREDITS.md).

## Chế độ trình chiếu (ảnh + nhạc)

`gallery.html` chạy 30 ảnh tự động (9 giây/ảnh), hiệu ứng zoom rất nhẹ, kèm 3 bản
nhạc nền CC0 phát lặp và tự chuyển bài. Nhạc chỉ bắt đầu sau khi bấm nút, đúng quy
định autoplay của trình duyệt; âm lượng vào dần ở mức 45%.

Phím tắt: `←` `→` đổi ảnh, `Space` tạm dừng/tiếp tục, `M` bật/tắt nhạc, `Esc` về album.
Trên điện thoại có thể vuốt ngang để đổi ảnh.
