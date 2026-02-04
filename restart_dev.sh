#!/bin/bash
# Kill any running Vite processes
pkill -f "vite" || true
sleep 1
# Start dev server
npm run dev
