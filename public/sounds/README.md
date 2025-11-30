# 音频文件说明

## 滴答声文件

请将你的滴答声音频文件放在这个目录下，文件名为 `tick.mp3`。

### 支持的音频格式
- `.mp3` (推荐)
- `.wav`
- `.ogg`
- `.m4a`

### 使用方法

1. 将你的音频文件重命名为 `tick.mp3`（或修改 `utils.ts` 中的 `TICK_SOUND_PATH` 变量）
2. 将文件放在 `public/sounds/` 目录下
3. 刷新浏览器即可使用

### 修改文件路径

如果你想使用不同的文件名或路径，可以修改 `utils.ts` 文件中的 `TICK_SOUND_PATH` 变量：

```typescript
const TICK_SOUND_PATH = '/sounds/your-filename.mp3';
```

### 调整音量

你可以在 `utils.ts` 的 `initTickAudio` 函数中修改音量：

```typescript
audio.volume = 0.5; // 0.0 (静音) 到 1.0 (最大音量)
```

---

## 闹钟声文件

请将你的闹钟声音频文件放在这个目录下，文件名为 `alarm.mp3`。

### 使用方法

1. 将你的音频文件重命名为 `alarm.mp3`（或修改 `utils.ts` 中的 `ALARM_SOUND_PATH` 变量）
2. 将文件放在 `public/sounds/` 目录下
3. 当番茄钟结束时，会自动播放闹钟声

### 修改文件路径

如果你想使用不同的文件名或路径，可以修改 `utils.ts` 文件中的 `ALARM_SOUND_PATH` 变量：

```typescript
const ALARM_SOUND_PATH = '/sounds/your-alarm-filename.mp3';
```

### 调整音量

你可以在 `utils.ts` 的 `initAlarmAudio` 函数中修改音量：

```typescript
audio.volume = 0.7; // 0.0 (静音) 到 1.0 (最大音量)
```

