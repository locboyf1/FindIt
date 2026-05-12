# FindIt - Ứng dụng Tìm Đồ Thất Lạc

## Tổng quan
**FindIt** là ứng dụng mobile giúp người dùng đăng tin tìm kiếm hoặc thông báo nhặt được đồ vật bị thất lạc. Giao diện hoàn toàn bằng **tiếng Việt**.

## Tech Stack
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| Expo | ~54.0.33 | Framework React Native |
| Expo Router | ~6.0.23 | File-based routing (typed routes) |
| Firebase Auth | via `firebase@12.9.0` | Xác thực (Email/Password), persistent bằng AsyncStorage |
| Firestore | via `firebase@12.9.0` | Database chính lưu bài viết |
| Firebase Storage | via `firebase@12.9.0` | Lưu ảnh bài viết & avatar |
| TypeScript | ~5.9.2 | Ngôn ngữ chính |
| React Native Maps | 1.20.1 | Bản đồ chọn vị trí |
| Expo Location | ~19.0.8 | Lấy vị trí GPS & reverse geocode |
| Expo Image Picker | ~17.0.10 | Chọn ảnh từ thư viện |
| Nunito Font | @expo-google-fonts/nunito | Font chữ chính |
| react-native-text-ticker | ^1.15.0 | Cuộn text dài trong thông báo/tin nhắn |

## Cấu trúc thư mục
```
FindIt/
├── app/                        # Màn hình (Expo Router file-based routing)
│   ├── _layout.tsx             # Root layout: auth guard, font loading, splash screen
│   ├── modal.tsx               # Modal screen (mặc định Expo)
│   ├── (tabs)/                 # Tab bar chính (4 tabs)
│   │   ├── _layout.tsx         # Tab layout: Trang chủ, Thông báo, Tin nhắn, Cộng đồng
│   │   ├── index.tsx           # Trang chủ: danh sách bài viết, filter, menu
│   │   ├── alerts.tsx          # Thông báo (dùng mock data)
│   │   ├── messages.tsx        # Tin nhắn (dùng mock data)
│   │   └── community.tsx       # Cộng đồng (placeholder)
│   ├── auth/
│   │   ├── login.tsx           # Đăng nhập (Email/Password + UI social chưa implement)
│   │   └── register.tsx        # Đăng ký (Email/Password)
│   ├── post/
│   │   ├── create-post.tsx     # Tạo bài viết mới
│   │   └── [id]/
│   │       ├── detail-post.tsx # Xem chi tiết bài viết
│   │       └── update-post.tsx # Sửa bài viết (updatePost chưa implement)
│   └── settings/
│       └── setting_account.tsx # Cài đặt tài khoản: đổi tên, avatar, mật khẩu
├── components/
│   ├── post-card.tsx           # Component card bài viết (dùng ở trang chủ)
│   ├── themed-text.tsx         # Text có theme
│   ├── themed-view.tsx         # View có theme
│   ├── external-link.tsx       # Link mở external
│   ├── haptic-tab.tsx          # Tab với haptic feedback
│   ├── hello-wave.tsx          # Animation wave (mặc định Expo)
│   ├── parallax-scroll-view.tsx # Parallax scroll (mặc định Expo)
│   └── ui/
│       ├── collapsible.tsx     # Component collapsible
│       ├── icon-symbol.tsx     # SF Symbol wrapper
│       └── icon-symbol.ios.tsx # SF Symbol iOS
├── configs/
│   ├── firebase-config.ts      # Firebase init: app, auth, db, storage
│   └── account-config.ts       # DEFAULT_AVATAR constant
├── constants/
│   └── theme.ts                # Colors object (light/dark mode)
├── hooks/
│   ├── use-color-scheme.ts     # Hook lấy color scheme
│   ├── use-color-scheme.web.ts # Color scheme cho web
│   └── use-theme-color.ts      # Hook lấy theme color
├── services/
│   ├── post-service.tsx        # CRUD bài viết (Firestore)
│   └── utilities-service.tsx   # Hàm tiện ích (formatTime, location matching)
└── assets/
    ├── data/
    │   ├── provinces.json      # Danh sách tỉnh/thành phố Việt Nam
    │   └── wards.json          # Danh sách phường/xã Việt Nam
    └── images/                 # Icon, splash, avatar mặc định
```

## Firebase Config
- **Project ID**: `fintit-44beb`
- **Auth**: Email/Password với `getReactNativePersistence(AsyncStorage)`
- **Exports**: `app`, `auth`, `db`, `storage`

## Firestore Schema

### Collection: `posts`
| Field | Type | Mô tả |
|---|---|---|
| `title` | string | Tiêu đề bài viết |
| `description` | string | Mô tả chi tiết |
| `location` | string | Địa điểm cụ thể (VD: "Canteen B4") |
| `provinceId` | number | Mã tỉnh/thành phố |
| `provinceName` | string | Tên tỉnh/thành phố |
| `wardId` | number | Mã phường/xã |
| `wardName` | string | Tên phường/xã |
| `geo` | object \| null | `{ lat: number, lng: number }` - tọa độ GPS |
| `type` | string | `'lost'` \| `'found'` |
| `image` | string | URL ảnh trên Firebase Storage |
| `userId` | string | UID người đăng |
| `userName` | string \| null | Tên hiển thị người đăng |
| `userAvatar` | string \| null | URL avatar người đăng |
| `createdAt` | Timestamp | Server timestamp |
| `status` | string | `'open'` (mặc định khi tạo) |

### Post Type & Status mapping
| Type | Label tiếng Việt | Màu |
|---|---|---|
| `lost` | Mất đồ | `#fa675f` (đỏ cam) |
| `found` | Tìm thấy | `#3293fb` (xanh dương) |
| `resolved` | Đã giải quyết | `Colors.light.success` (xanh lá) |
| `returned` | Đã trả lại | `Colors.light.success` (xanh lá) |

## Services

### `post-service.tsx`
| Hàm | Chức năng |
|---|---|
| `createPost(data)` | Tạo bài viết mới (upload ảnh → lưu Firestore) |
| `getPosts()` | Lấy tất cả bài viết (sắp xếp theo `createdAt` giảm dần) |
| `getPostById(postId)` | Lấy 1 bài viết theo ID |
| `updateUserInPost(userId, userName, userAvatar)` | Batch update thông tin user trên tất cả bài viết của user đó |
| `uploadImage(image)` | Upload ảnh lên Firebase Storage, trả về download URL |

> **Lưu ý**: Chưa có hàm `updatePost` - màn hình `update-post.tsx` đã có UI nhưng logic gọi API bị comment out.

### `utilities-service.tsx`
| Hàm | Chức năng |
|---|---|
| `formatTime(timestamp)` | Chuyển Firestore Timestamp → "Vừa xong", "X phút trước", "X giờ trước", "X ngày trước" |
| `normalizeLocation(text)` | Chuẩn hóa tên địa danh Việt Nam (bỏ dấu, bỏ prefix tỉnh/huyện/xã...) |
| `isMatchLocation(name1, name2)` | So sánh 2 tên địa danh đã chuẩn hóa |

## Luồng Navigation

### Auth Flow (trong `_layout.tsx`)
1. Lắng nghe `onAuthStateChanged`
2. Nếu **đã đăng nhập** + đang ở `/auth` → redirect → `/(tabs)`
3. Nếu **chưa đăng nhập** + không ở `/auth` → redirect → `/auth/login`

### Tab Bar (4 tabs)
| Tab | Tên | Icon | File |
|---|---|---|---|
| 1 | Trang chủ | `home` | `(tabs)/index.tsx` |
| 2 | Thông báo | `notifications` + badge | `(tabs)/alerts.tsx` |
| 3 | Tin nhắn | `chatbubble` + badge | `(tabs)/messages.tsx` |
| 4 | Cộng đồng | `people` | `(tabs)/community.tsx` |

### Post Flow
1. **Trang chủ** → nhấn `+` → `post/create-post`
2. **Trang chủ** → nhấn card → `post/[id]/detail-post`
3. **Detail** → nhấn "Sửa" (nếu là owner) → `post/[id]/update-post`
4. **Trang chủ** → nhấn logo → menu dropdown → "Tài khoản" → `settings/setting_account`
5. **Trang chủ** → nhấn icon search → filter bar (Tất cả / Mất đồ / Thấy đồ)

## Trang chính - Tính năng chi tiết

### Trang chủ (`index.tsx`)
- Hiển thị danh sách bài viết dạng `FlatList` với `PostCard`
- Pull-to-refresh
- Filter theo loại: Tất cả / Mất đồ / Thấy đồ
- Menu dropdown (Tài khoản, Đăng xuất)
- Kiểm tra `auth.currentUser` trước khi fetch

### Tạo/Sửa bài viết (`create-post.tsx` / `update-post.tsx`)
- Chọn loại: MẤT ĐỒ / NHẶT ĐƯỢC
- Chọn ảnh từ thư viện (ImagePicker, 4:3, quality 0.5)
- Chọn Tỉnh/Thành phố → Phường/Xã (Modal + FlatList từ JSON local)
- Nhập tiêu đề, địa điểm, mô tả
- Ghim vị trí trên bản đồ (MapView)
- Tự động detect vị trí GPS → reverse geocode → auto-fill tỉnh/phường/đường

### Chi tiết bài viết (`detail-post.tsx`)
- Ảnh lớn phía trên, content bo tròn overlay
- Badge trạng thái + thời gian
- Thông tin địa điểm (location + ward + province)
- Thông tin người đăng (avatar + tên)
- Nút "Liên hệ" (chưa implement) / "Sửa" (nếu là chủ bài viết) / "Báo cáo"
- MapView hiển thị vị trí (nếu có geo)

### Cài đặt tài khoản (`setting_account.tsx`)
- Đổi avatar (upload lên Firebase Storage, xóa ảnh cũ)
- Đổi tên hiển thị
- Đổi mật khẩu (yêu cầu re-authenticate)
- Khi lưu → cập nhật cả `displayName` + `photoURL` trên Firebase Auth, batch update `userName` + `userAvatar` trên tất cả bài viết

## Theme / Design System
- **Font**: Nunito (Regular, SemiBold, Bold)
- **Primary color (light)**: `#007AFF`
- **Primary color (dark)**: `#0A84FF`
- **Icon library**: `@expo/vector-icons` → `Ionicons`, `AntDesign`
- **Hỗ trợ Light/Dark mode** (cấu hình sẵn nhưng chủ yếu dùng light)

## Tính năng chưa hoàn thành
1. **`updatePost`** - Hàm cập nhật bài viết trong `post-service.tsx` chưa viết
2. **Social login** - Google/Github/Apple chỉ có UI, chưa implement
3. **Tin nhắn** - Dùng mock data, chưa kết nối backend
4. **Thông báo** - Dùng mock data, chưa kết nối backend
5. **Cộng đồng** - Trang placeholder trống
6. **Nút "Liên hệ"** - Trong detail-post, chưa implement
7. **Nút "Báo cáo"** - Trong detail-post, chưa implement
8. **Badge thông báo/tin nhắn** - Đang hardcode số (10, 99)
9. **Xóa bài viết** - Chưa có chức năng

## Lệnh chạy
```bash
npx expo start       # Chạy dev server
npm run android       # Chạy trên Android
npm run ios           # Chạy trên iOS
```
