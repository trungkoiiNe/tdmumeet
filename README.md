# TDMU Meet - Team Management App

TDMU Meet là ứng dụng quản lý nhóm, trao đổi, và cộng tác thời gian thực dành cho sinh viên, giáo viên và các nhóm dự án. Ứng dụng hỗ trợ tạo nhóm, quản lý thành viên, nhắn tin, gọi video, và nhiều tính năng hiện đại khác.

---

## Tính năng nổi bật

- 🔐 Đăng nhập Google Authentication
- 👥 Quản lý Team
  - Tạo team với avatar, mô tả, tag, chế độ công khai/riêng tư
  - Tham gia team qua lời mời hoặc tự do (nếu public)
  - Cập nhật thông tin team, đổi avatar
  - Xóa team (chỉ chủ sở hữu)
  - Mời/kick thành viên
- 💬 Nhắn tin theo kênh (channel) trong team, gửi file ảnh
- 🔄 Cập nhật thời gian thực (Firestore)
- 📅 Lịch sự kiện (Calendar)
- 📱 Giao diện hiện đại, hỗ trợ đa nền tảng (iOS & Android)
- 🎥 Gọi video (Agora)
- 🌙 Hỗ trợ Dark/Light Theme
- ⚡ Hiệu suất tối ưu, animation mượt mà

---

## Công nghệ sử dụng

- [React Native](https://reactnative.dev/)  
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [@baronha/ting](https://github.com/baronha/ting) - Toast notification
- [Agora](https://www.agora.io/) - Video Call
- [Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Expo Calendar](https://docs.expo.dev/versions/latest/sdk/calendar/) - Lịch sự kiện

---

## Cấu trúc dự án

```
├── app/                    # Màn hình chính của ứng dụng
│   ├── (users)/            # Các tab: Home, Teams, Calendar, Settings, Calling
│   ├── _layout.tsx         # Cấu hình layout gốc
│   └── index.tsx           # Entry point
├── components/             # Các component tái sử dụng (modal, calling, ...)
├── stores/                 # State management (authStore, teamStore)
├── utils/                  # Helper, theme, avatar, ...
├── assets/                 # Ảnh, font, ...
└── README.md
```

---

## Cài đặt & chạy thử

### Yêu cầu

- Node.js >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio (Android) / Xcode (iOS)
- Firebase project (Authentication + Firestore)

### Các bước

1. **Clone repo**
    ```bash
    git clone <repository-url>
    cd tdmumeet
    ```

2. **Cài đặt dependencies**
    ```bash
    npm install
    ```

3. **Cấu hình Firebase**
    - Tạo project Firebase mới
    - Bật Google Authentication
    - Bật Cloud Firestore
    - Tải `google-services.json` về và đặt vào `android/app`
    - Cập nhật web client ID trong `stores/authStore.tsx`

4. **Chạy ứng dụng**
    ```bash
    npm start
    # hoặc
    npx expo start
    ```

5. **Chạy trên thiết bị**
    ```bash
    # Android
    npm run android

    # iOS (chỉ trên macOS)
    npm run ios
    ```

---

## Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m 'Thêm tính năng ...'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## License

MIT License

---

## Tài liệu tham khảo

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)