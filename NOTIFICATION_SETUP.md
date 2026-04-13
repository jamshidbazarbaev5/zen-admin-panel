# Order Notification Setup

## What was added:

### 1. Sound Notification
- When a new order is created, a notification sound plays automatically
- The sound file should be placed at `/public/notification.mp3`
- Volume is set to 70% by default

### 2. New Orders Counter Badge
- A red badge appears next to the "Заказы" title showing the count of new orders
- The badge displays a bell icon with the number of new orders
- Click the badge to reset the counter to 0

### 3. Visual Indicator
- A blue pulsing "Новый заказ!" indicator appears for 5 seconds when a new order arrives
- This provides immediate visual feedback

## How to add your notification sound:

1. Download a notification sound (MP3 format recommended)
   - Free sounds: https://notificationsounds.com/
   - Or: https://freesound.org/

2. Save the file as `notification.mp3` in the `zen-admin-panel/public/` folder

3. The sound will play automatically when new orders arrive

## Features:

- ✅ Sound plays only for new orders (not for updates)
- ✅ Counter increments with each new order
- ✅ Click counter badge to reset
- ✅ Visual pulse indicator for 5 seconds
- ✅ WebSocket connection status indicator
- ✅ Automatic reconnection if connection drops

## Customization:

To change the volume, edit line 100 in `OrdersPage.tsx`:
```typescript
audioRef.current.volume = 0.7; // Change 0.7 to any value between 0.0 and 1.0
```

To change how long the "Новый заказ!" indicator shows, edit line 151:
```typescript
setTimeout(() => setNewOrderIndicator(false), 5000); // Change 5000 to milliseconds
```
