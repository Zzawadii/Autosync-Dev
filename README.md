# 🚀 AutoSync Dev

AutoSync Dev is a developer productivity tool that prevents loss of uncommitted work by automatically tracking file changes and creating intelligent Git backups.

## 📌 Features

- 📁 Real-time file monitoring
- ⏱️ Smart commit system based on inactivity
- 🔄 Automatic Git integration
- 🛡️ Backup repository system
- ⚠️ Crash recovery support

## 🚀 Installation

```bash
npm install
npm link
```

## 📖 Usage

### Start monitoring

```bash
autosync start
```

### Options

```bash
autosync start --dir /path/to/project    # Monitor specific directory
autosync start --interval 600            # Set inactivity interval (seconds)
autosync start --remote backup           # Set remote name
```

## ⚙️ Setup

1. Initialize a Git repository (if not already):
   ```bash
   git init
   ```

2. Add a backup remote repository:
   ```bash
   git remote add updates <your-backup-repo-url>
   ```

3. Start AutoSync:
   ```bash
   autosync start
   ```
## Structure
```bash
secure-auth/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── validator.js       # Input validation
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   ├── utils/
│   │   ├── email.js           # Email sending
│   │   ├── logger.js          # Login tracking
│   │   └── tokens.js          # Token generation
│   └── server.js              # Express app
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```
## 🔧 How It Works

1. AutoSync monitors your project directory for file changes
2. When files change, it starts an inactivity timer (default: 5 minutes)
3. After the timer expires, it creates a commit with all changes
4. The commit is pushed to your backup remote repository
5. On restart, it checks for uncommitted changes and backs them up

## 💡 Tips

- Use a separate backup repository to keep your main history clean
- Adjust the inactivity interval based on your workflow
- The tool ignores `.git` and `node_modules` directories

## 👤 Author

Zawadii — Software developer focused on building practical and impactful tools.

## 📄 License

MIT
