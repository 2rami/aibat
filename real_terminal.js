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
  
  // 개발자 도구 열기 (디버깅용)
  // mainWindow.webContents.openDevTools();
}

function createTerminals() {
  console.log('실제 터미널 생성 중...');
  
  // Claude 터미널 생성 (VS Code처럼)
  claudeTerminal = pty.spawn('claude', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });

  // Gemini 터미널 생성 (VS Code처럼)
  geminiTerminal = pty.spawn('gemini', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
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
    claudeTerminal.write(command + '\n');
  }
  
  if (geminiTerminal) {
    geminiTerminal.write(command + '\n');
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