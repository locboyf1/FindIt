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
│   │       └── update-post.tsx # Sửa bài viết
│   ├── user/
│   │   └── user.tsx            # Trang cá nhân người dùng
│   └── settings/
│       └── setting_account.tsx # Cài đặt tài khoản: đổi tên, avatar, mật khẩu
├── components/
│   ├── post-card.tsx           # Component card bài viết (dùng ở trang chủ)
│   ├── post-list.tsx           # Component item danh sách bài viết (dùng ở trang cá nhân)
│   ├── tab-bar-gap.tsx         # Khoảng trống tránh bị Tab Bar che nội dung
│   ├── loading-layout.tsx      # Overlay khi đang tải dữ liệu
│   ├── themed-text.tsx         # Text có theme
│   ├── themed-view.tsx         # View có theme
│   └── ui/
│       ├── collapsible.tsx     # Component collapsible
│       ├── icon-symbol.tsx     # SF Symbol wrapper
│       └── icon-symbol.ios.tsx # SF Symbol iOS
├── configs/
│   ├── firebase-config.ts      # Firebase init: app, auth, db, storage
│   └── user.ts                 # DEFAULT_AVATAR constant
├── constants/
│   ├── theme.ts                # Colors object (light/dark mode)
│   ├── user.ts                 # Hằng số liên quan user
│   └── post.ts                 # Hằng số liên quan bài viết (EMPTY_POST)
├── hooks/
│   ├── use-color-scheme.ts     # Hook lấy color scheme
│   └── use-theme-color.ts      # Hook lấy theme color
├── services/
│   ├── post-service.tsx        # CRUD bài viết (Firestore)
│   ├── user-service.tsx        # Quản lý tài khoản và thông tin user (Firestore)
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
| `status` | string | `'open'` \| `'resolved'` |
| `isHidden` | boolean | Trạng thái ẩn bài viết |
| `isBanned` | boolean | Trạng thái bài viết bị khóa |

### Collection: `users`
| Field | Type | Mô tả |
|---|---|---|
| `userName` | string | Tên hiển thị |
| `email` | string | Email tài khoản |
| `userId` | string | UID từ Firebase Auth |
| `isBanned` | boolean | Trạng thái tài khoản bị khóa |
| `role` | string | Quyền hạn (`user` / `admin`) |
| `createdAt` | Timestamp | Ngày tham gia |
| `userAvatar` | string \| null | URL avatar |

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
| `getPostsByUserId(userId, isOwner)` | Lấy bài viết của user (có lọc ẩn/khóa nếu không phải chủ) |
| `updatePost(id, data)` | Cập nhật thông tin bài viết |
| `updateUserInPost(userId, userName, userAvatar)` | Batch update thông tin user trên tất cả bài viết của user đó |
| `uploadImage(image)` | Upload ảnh lên Firebase Storage, trả về download URL |

### `user-service.tsx`
| Hàm | Chức năng |
|---|---|
| `registerAccount(data)` | Đăng ký tài khoản (Auth + Firestore) |
| `loginAccount(data)` | Đăng nhập tài khoản |
| `changePassword(data)` | Đổi mật khẩu |
| `updateAccount(data)` | Cập nhật thông tin cá nhân (tên, avatar) |
| `getUserById(userId)` | Lấy thông tin chi tiết user từ Firestore |

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

### Trang cá nhân (`user.tsx`)
- Hiển thị thông tin người dùng (tên, avatar)
- Thống kê số lượng bài đăng và bài đã giải quyết thành công
- Hiển thị danh sách bài viết của người đó bằng `PostList`
- Tự động lọc bài ẩn/khóa nếu người xem không phải là chủ trang cá nhân

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
- Thông tin người đăng (avatar + tên) → Nhấn để vào Trang cá nhân
- Nút "Liên hệ" (chưa implement) / "Sửa" (nếu là chủ bài viết) / "Báo cáo"
- MapView hiển thị vị trí (nếu có geo)

### Cài đặt tài khoản (`setting_account.tsx`)
- Đổi avatar (upload lên Firebase Storage, xóa ảnh cũ)
- Đổi tên hiển thị
- Đổi mật khẩu (yêu cầu re-authenticate)
- Khi lưu → cập nhật cả `displayName` + `photoURL` trên Firebase Auth, cập nhật Firestore collection `users`, batch update `userName` + `userAvatar` trên tất cả bài viết

## Theme / Design System
- **Font**: Nunito (Regular, SemiBold, Bold)
- **Primary color (light)**: `#007AFF`
- **Primary color (dark)**: `#0A84FF`
- **Icon library**: `@expo/vector-icons` → `Ionicons`, `AntDesign`
- **Hỗ trợ Light/Dark mode** (cấu hình sẵn nhưng chủ yếu dùng light)

## Tính năng chưa hoàn thành
1. **Social login** - Google/Github/Apple chỉ có UI, chưa implement
2. **Tin nhắn** - Dùng mock data, chưa kết nối backend
3. **Thông báo** - Dùng mock data, chưa kết nối backend
4. **Cộng đồng** - Trang placeholder trống
5. **Nút "Liên hệ"** - Trong detail-post, chưa implement
6. **Nút "Báo cáo"** - Trong detail-post, chưa implement
7. **Badge thông báo/tin nhắn** - Đang hardcode số (10, 99)
8. **Xóa bài viết** - Chưa có chức năng

## Lệnh chạy
```bash
npx expo start       # Chạy dev server
npm run android       # Chạy trên Android
npm run ios           # Chạy trên iOS
```
