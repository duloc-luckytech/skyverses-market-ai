#!/bin/bash
# ============================================================
# 📦 Install MongoDB Tools — Ubuntu/Debian Linux
# ============================================================
# Run this FIRST if mongosh, mongodump, mongorestore not installed
# Usage: sudo bash scripts/install-mongo-tools.sh
# ============================================================

set -e

echo "📦 Installing MongoDB tools..."

# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg 2>/dev/null || true

# Add MongoDB repo (Ubuntu 22.04 / Debian 12)
DISTRO=$(lsb_release -cs 2>/dev/null || echo "jammy")
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${DISTRO}/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update -qq

# Install MongoDB server + shell + tools
sudo apt-get install -y mongodb-org mongodb-org-tools mongodb-mongosh mongodb-database-tools

# Enable and start MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod

# Verify
echo ""
echo "✅ Installed versions:"
mongod --version | head -1
mongosh --version 2>/dev/null || echo "mongosh: not found"
mongodump --version 2>/dev/null || echo "mongodump: not found"
mongorestore --version 2>/dev/null || echo "mongorestore: not found"

echo ""
echo "✅ MongoDB service status:"
sudo systemctl status mongod --no-pager | head -5
