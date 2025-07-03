const { app, BrowserWindow, ipcMain } = require('electron');
const pty = require('node-pty');
const path = require('path');

let mainWindow;
let claudeTerminal;
let geminiTerminal;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: '🥊 AI 배틀 - 실제 터미널'
  });

  mainWindow.loadFile('real_terminal.html');
  
  // 개발자 도구는 F12로만 열기 (기본적으로 닫힌 상태)
  // mainWindow.webContents.openDevTools();
}

function createTerminals() {
  console.log('실제 터미널 생성 중...');
  
  // Claude 터미널 생성 (VS Code처럼)
  claudeTerminal = pty.spawn('claude', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' }
  });

  // Gemini 터미널 생성 (VS Code처럼)
  geminiTerminal = pty.spawn('gemini', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' }
  });

  // Claude 터미널 출력을 프론트엔드로 전송
  claudeTerminal.onData((data) => {
    if (mainWindow) {
      mainWindow.webContents.send('claude-data', data);
    }
  });

  // Gemini 터미널 출력을 프론트엔드로 전송
  geminiTerminal.onData((data) => {
    if (mainWindow) {
      mainWindow.webContents.send('gemini-data', data);
    }
  });

  // 커서 깜빡임 제거 (채팅창에 나타나는 문제 해결)
  
  console.log('실제 터미널 준비 완료!');
}

// 프론트엔드에서 키보드 입력 받기
ipcMain.on('claude-input', (event, data) => {
  if (claudeTerminal) {
    claudeTerminal.write(data);
  }
});

ipcMain.on('gemini-input', (event, data) => {
  if (geminiTerminal) {
    geminiTerminal.write(data);
  }
});

// 터미널 크기 조정
ipcMain.on('claude-resize', (event, size) => {
  if (claudeTerminal) {
    claudeTerminal.resize(size.cols, size.rows);
  }
});

ipcMain.on('gemini-resize', (event, size) => {
  if (geminiTerminal) {
    geminiTerminal.resize(size.cols, size.rows);
  }
});

// 두 터미널에 동시 입력
ipcMain.on('send-to-both', (event, command) => {
  console.log('두 터미널에 동시 전송:', command);
  
  if (claudeTerminal) {
    claudeTerminal.write(command);
    claudeTerminal.write('\r'); // 엔터키 자동 입력
  }
  
  if (geminiTerminal) {
    geminiTerminal.write(command);
    geminiTerminal.write('\r'); // 엔터키 자동 입력
  }
});

// 두 터미널에 엔터만 전송
ipcMain.on('send-enter-both', (event) => {
  console.log('두 터미널에 엔터 전송');
  
  if (claudeTerminal) {
    claudeTerminal.write('\r');
  }
  
  if (geminiTerminal) {
    geminiTerminal.write('\r');
  }
});

// 개발자 도구 토글
ipcMain.on('toggle-devtools', (event) => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
  }
});

app.whenReady().then(() => {
  createWindow();
  createTerminals();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (claudeTerminal) claudeTerminal.destroy();
  if (geminiTerminal) geminiTerminal.destroy();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});