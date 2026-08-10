# Keyboard Shortcuts

Cross-platform shortcuts for Excalidesk. **macOS** uses Cmd; **Windows/Linux** uses Ctrl.

## App Level (System)

| Shortcut | Action | Notes |
|----------|--------|-------|
| Cmd+Q | Quit | Handled by Electron menu |
| Cmd+H | Hide | Handled by Electron menu |
| Cmd+M | Minimize | Handled by native window |
| Cmd+W | Close Tab | App-level, closes active tab |
| Cmd+Tab | Switch App | Native OS |

## File & Saving

| Shortcut | Action | Handler |
|----------|--------|---------|
| Cmd+S | Save File | **App-level** (immediate, not auto-save debounce) |
| Cmd+O | Open Folder | **App-level** (opens vault picker) |
| Cmd+N | New File | **App-level** (creates new sketch) |

## Canvas & Drawing (Excalidraw)

| Shortcut | Action | Handler |
|----------|--------|---------|
| Cmd+Z | Undo | **Excalidraw** (native supported) |
| Cmd+Shift+Z | Redo | **Excalidraw** (native supported) |
| Cmd+1 | Select Tool | **Excalidraw** |
| Cmd+2 | Draw/Pencil | **Excalidraw** |
| Cmd+D | Duplicate | **Excalidraw** |
| Delete | Delete Selection | **Excalidraw** |
| Cmd+/ | Toggle Compact UI | **App-level** (feature) |
| Esc | Exit Focus Mode | **App-level** (if in focus mode) |
| Esc | Close Modals | **Excalidraw** (modals, dropdowns) |

## Text Editing (in Excalidraw Text Mode)

| Shortcut | Action | Handler |
|----------|--------|---------|
| Cmd+A | Select All | **App-level handler** (custom forwarding to textarea) |
| Cmd+C | Copy | **App-level handler** (custom forwarding to textarea) |
| Cmd+V | Paste | **App-level handler** (custom forwarding to textarea) |
| Cmd+X | Cut | **Excalidraw** (native textarea) |
| Cmd+B | Bold | **Excalidraw** (text formatting) |
| Cmd+I | Italic | **Excalidraw** (text formatting) |
| Cmd+U | Underline | **Excalidraw** (text formatting) |

## Known Conflicts & Resolutions

### ✅ Cmd+S (Save)
- **Conflict:** Both Excalidraw and app want to handle it
- **Solution:** App-level handler prevents propagation, flushes auto-save
- **Status:** Fixed

### ✅ Cmd+A/C/V (Text Editing)
- **Conflict:** Excalidraw's custom text editor doesn't forward these
- **Solution:** App-level keyboard listener detects textarea focus, forwards events
- **Status:** Fixed

### ✅ Cmd+Z/Shift+Z (Undo/Redo)
- **Conflict:** Both can handle; Excalidraw's is more useful
- **Solution:** Let Excalidraw handle; browser undo/redo is less relevant
- **Status:** No action needed

### ⚠️ Esc (Close Focus Mode vs Modals)
- **Conflict:** Focus mode exit also needs to close any open modals first
- **Solution:** App checks for `.excalidraw-modal-container` and `.dropdown-menu` before exiting
- **Status:** Handled (see `focus-store.ts`)

## Implementation Details

### Keyboard Handler Locations

1. **Canvas-stage component** (`widgets/canvas-stage/ui/canvas-stage.tsx`)
   - Cmd+S: app-level save
   - Cmd+A/C/V: text editor forwarding

2. **Focus mode store** (`features/focus-mode/model/focus-store.ts`)
   - Esc: exit focus mode (respects modal/dropdown state)

3. **Tab strip** (`features/tab-management/ui/tab-strip.tsx`)
   - Cmd+1 through Cmd+8: switch tabs (if added)

4. **Native Electron Menu**
   - Cmd+Q, Cmd+H: app quit/hide

## Adding New Shortcuts

1. **App-level:** Add to appropriate feature store or component
2. **Canvas-only:** Let Excalidraw handle (no override needed)
3. **Text editor:** Forward via `textarea` lookup in canvas container
4. **System-level:** Add to `main/index.ts` Electron menu

## Testing

- Test in both **browser** (web) and **Electron** (desktop/electron) shells
- Verify shortcuts don't interfere with Excalidraw canvas shortcuts
- Check modal/dropdown states before app handlers fire
