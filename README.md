# 🥊 AI Battle - Claude vs Gemini

Claude Code와 Gemini CLI를 동시에 실행하고 비교할 수 있는 Electron 기반 GUI 애플리케이션입니다.

## 🚀 특징

- **실제 터미널 임베드**: VS Code처럼 실제 Claude와 Gemini 터미널이 GUI 안에서 동작
- **동시 실행**: 한 번의 입력으로 두 AI에게 동시에 명령어 전송
- **실시간 비교**: 두 AI의 응답을 나란히 비교
- **VS Code 스타일**: 친숙한 터미널 인터페이스

## 📋 필요 조건

- Node.js (v16 이상)
- Claude Code CLI 설치
- Gemini CLI 설치

## 🔧 설치

1. 저장소 클론
```bash
git clone https://github.com/[your-username]/ai-battle.git
cd ai-battle
```

2. 의존성 설치
```bash
npm install
```

3. 실행
```bash
npm start
```

## 🎯 사용법

1. 애플리케이션 실행 후 두 개의 터미널이 나타납니다
2. 각 터미널에 직접 입력하거나
3. 아래 입력창에서 두 AI에게 동시에 명령어를 보낼 수 있습니다
4. Enter키 또는 전송 버튼으로 실행

## 🛠️ 기술 스택

- **Electron**: 크로스 플랫폼 데스크톱 앱
- **xterm.js**: 터미널 에뮬레이터
- **node-pty**: 가상 터미널 인터페이스
- **JavaScript**: 메인 로직

## 📁 프로젝트 구조

```
aibat/
├── real_terminal.js      # Electron 메인 프로세스
├── real_terminal.html    # 프론트엔드 UI
├── package.json          # 프로젝트 설정
└── README.md            # 프로젝트 설명
```

## 🤝 기여

이슈나 풀 리퀘스트는 언제든지 환영입니다!

## 📝 라이선스

MIT License

---

Made with ❤️ for AI enthusiasts