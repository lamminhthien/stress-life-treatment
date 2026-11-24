# stress-life-treatment

Một trang tĩnh nhỏ gọn, dịu mắt về bốn cách hạ nhiệt khi áp lực đè nặng:
xem ảnh, câu nói "hãm phanh", âm nhạc và đọc sách.

## Nội dung

- `index.html` — toàn bộ nội dung trang
- `album.html` — album "Reset": 30 ảnh thư giãn chia 3 nhóm cảm xúc
- `gallery.html` — chế độ trình chiếu toàn màn hình, chạy ảnh cùng nhạc nền
- `listen.html` — nghe thay vì đọc: 30 câu nói, máy đọc bằng giọng có sẵn trong máy
  (Web Speech API, miễn phí, không cần mạng), kèm danh sách nguồn nghe online free
- `books.html` — danh sách 15 đầu sách cụ thể theo 3 nhóm: tản văn nhẹ, truyện ngắn
  slice-of-life, tâm lý cảm xúc dễ hiểu; mỗi cuốn có ghi chú vì sao hợp lúc căng thẳng
  và nhịp đọc gợi ý
- `music.html` — nghe riêng 3 bản nhạc CC0: play/pause, tua, âm lượng, chuyển bài mà
  vẫn giữ vị trí đang nghe
- `hoan-lo.html` — công cụ "Hoãn lo": ghi suy nghĩ đang lặp, hẹn khung giờ lo và đếm
  ngược tới giờ đó; danh sách lưu bằng `localStorage`, xem lại và đóng từng mục
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

## Danh sách sách

`books.html` chia 15 đầu sách theo đúng 3 nhóm ở mục 04 của trang chủ. Mỗi cuốn ghi
tên, tác giả, 1–2 câu vì sao hợp lúc mệt và nhịp đọc (số trang/độ dài ước lượng).
Không có link mua sách — chỉ là danh sách để chọn.

## Nghe thay vì đọc

`listen.html` đọc chậm 30 câu nói bằng giọng tiếng Việt có sẵn trên máy, qua Web
Speech API của trình duyệt — không cần API key, không gửi nội dung đi đâu. Có chọn
giọng, chọn tốc độ (mặc định 0.85, cao độ 0.92 cho giọng êm hơn), nghỉ ~3 giây giữa
các câu, tạm dừng/tiếp tục, và bấm từng câu để nghe riêng. Nếu máy chưa cài giọng
tiếng Việt, trang hiện hướng dẫn cài trên Android/iPhone.

Cuối trang có sẵn vài nguồn nghe miễn phí (playlist YouTube nhạc thiền, kênh
Fonos — Tự Chữa Lành, podcast Minh Niệm và Viết Chữa Lành trên Spotify).

## Chia sẻ và SEO

- `favicon.svg` — vòng thở trên nền xanh đậm, khai báo `rel="icon"` ở mọi trang.
- `og-image.png` 1200×630 cắt từ ảnh CC0 trong album; mọi trang có `og:title`,
  `og:description`, `og:image`, `og:url`, `canonical` và `twitter:card`.
- `404.html` cùng phong cách, link tuyệt đối về trang chủ (GitHub Pages phục vụ nó ở
  mọi đường dẫn sai, kể cả đường dẫn lồng nhau).
- `sitemap.xml` (6 trang) + `robots.txt` trỏ tới sitemap.

## Chọn nhanh theo mức độ

Mục `#chon-nhanh` có 3 nút lớn (Hơi bực / Căng cứng / Rối bời cuối ngày). Bấm một nút
sẽ chèn đúng một gợi ý từ `<template>` tương ứng kèm nút dẫn thẳng tới khối thở, trang
nghe nhạc, trình chiếu hoặc danh sách sách. Nút dùng `aria-pressed`, kết quả nằm trong
vùng `aria-live="polite"`. Bảng tĩnh 3 dòng vẫn còn trong DOM và chỉ ẩn khi có JS
(`.js .table-fallback`) nên không có script vẫn đọc được.

## Khối thở 30 giây

Đầu trang chủ có khối `#tho` hướng dẫn nhịp 4 – 4 – 6 và một vòng tròn co giãn theo nhịp:
hít 4 giây, giữ 4, thở ra 6, chạy đủ 30 giây (khoảng hai vòng). Đếm ngược và nhịp hiện
thành chữ nên vẫn dùng được khi bật `prefers-reduced-motion` (khi đó vòng tròn không co
giãn, chỉ đổi trạng thái). Chuyển sang tab khác thì đồng hồ tự dừng để không đếm lệch.

## Nghe nhạc riêng

`music.html` phát trực tiếp 3 bản trong `audio/` mà không cần bật trình chiếu. Mỗi bản
dùng một thẻ `Audio` riêng (preload metadata) nên vị trí đang nghe được giữ khi chuyển
bài; chỉ một bản phát tại một thời điểm, âm lượng chỉnh chung và đồng bộ giữa các thanh
trượt. Trạng thái đang phát / tạm dừng / phát xong được báo qua `role="status"`.

## Chế độ trình chiếu (ảnh + nhạc)

`gallery.html` chạy 30 ảnh tự động (9 giây/ảnh), hiệu ứng zoom rất nhẹ, kèm 3 bản
nhạc nền CC0 phát lặp và tự chuyển bài. Nhạc chỉ bắt đầu sau khi bấm nút, đúng quy
định autoplay của trình duyệt; âm lượng vào dần ở mức 45%.

Phím tắt: `←` `→` đổi ảnh, `Space` tạm dừng/tiếp tục, `M` bật/tắt nhạc, `Esc` về album.
Trên điện thoại có thể vuốt ngang để đổi ảnh.
