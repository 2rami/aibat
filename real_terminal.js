const { app, BrowserWindow, ipcMain } = require('electron');
const pty = require('node-pty');
const path = require('path');
const os = require('os');

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
  
  // 바탕화면 경로 (크로스플랫폼)
  const desktopPath = path.join(os.homedir(), 'Desktop');
  console.log('시작 경로:', desktopPath);
  
  // PATH 환경변수 확장 (배포된 앱용)
  const expandedPath = [
    '/usr/local/bin',
    '/usr/bin', 
    '/bin',
    path.join(os.homedir(), '.npm-global', 'bin'),
    path.join(os.homedir(), 'node_modules', '.bin'),
    process.env.PATH || ''
  ].join(':');
  
  const terminalEnv = {
    ...process.env,
    TERM: 'xterm-256color',
    PATH: expandedPath
  };
  
  console.log('확장된 PATH:', expandedPath);
  
  // Claude 터미널 생성 (쉘을 통해 실행)
  claudeTerminal = pty.spawn('/bin/bash', ['-c', `cd "${desktopPath}" && claude`], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: desktopPath,
    env: terminalEnv
  });

  // Gemini 터미널 생성 (쉘을 통해 실행)
  geminiTerminal = pty.spawn('/bin/bash', ['-c', `cd "${desktopPath}" && gemini`], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: desktopPath,
    env: terminalEnv
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

  // 초기 메시지 제거 (ANSI 이스케이프 시퀀스 문제 해결)
  
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

// 터미널 크기 조정 (에러 방지)
ipcMain.on('claude-resize', (event, size) => {
  try {
    if (claudeTerminal && claudeTerminal.pid) {
      claudeTerminal.resize(size.cols, size.rows);
    }
  } catch (error) {
    console.log('Claude 터미널 크기 조정 오류 (무시됨):', error.message);
  }
});

ipcMain.on('gemini-resize', (event, size) => {
  try {
    if (geminiTerminal && geminiTerminal.pid) {
      geminiTerminal.resize(size.cols, size.rows);
    }
  } catch (error) {
    console.log('Gemini 터미널 크기 조정 오류 (무시됨):', error.message);
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