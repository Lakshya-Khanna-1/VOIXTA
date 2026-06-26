#!/bin/bash
echo ""
echo "======================================"
echo "  VoiceGuard — Setup Script"
echo "======================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Download it from: https://nodejs.org (v18 or higher)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js v18+ required. You have $(node -v)"
  exit 1
fi

echo "Node.js $(node -v) found."
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "======================================"
echo "  Starting VoiceGuard Dev Server"
echo "======================================"
echo ""
echo ">> Open: http://localhost:3000"
echo ">> Use Chrome or Edge for voice detection."
echo ">> Press Ctrl+C to stop."
echo ""
npm run dev
