# GardenPedia Enhanced - Quick Start Guide

## First Time? Start Here

### 1. **Open the App**
The app now has a login screen. You'll see it immediately.

### 2. **Sign In**
```
Email:    drew@thegardener.co.za
Password: admin123
```
✅ **Check "Remember me"** to stay logged in

### 3. **Configure Claude Pro**
1. Click **Settings** (05)
2. Under "AI Provider" → Select **Claude**
3. Select plan: **Pro**
4. Paste your Claude API key (get it from https://console.anthropic.com)
5. Click **Save Settings**
6. Click **Test Connection** to verify

### 4. **Invite Team Members**
1. In Settings → Scroll to "Team Members (Admin)"
2. Click **Invite Team Member**
3. Enter their email: `name@example.com`
4. They can now sign in with password: `welcome123`

### 5. **Team Member Setup**
They should:
1. Sign in with their email and password `welcome123`
2. Go to Settings
3. Select Claude → Free (to use your admin Pro key)
4. Save and Done!

---

## Key Features at a Glance

| Feature | Who | What |
|---------|-----|------|
| **Chat** | Everyone | Talk to Claude with auto-formatting |
| **Fact Finder** | Everyone | Generate 40 garden facts automatically |
| **Research** | Everyone | Get sourced answers with citations |
| **Settings** | Everyone | Choose AI provider & save API keys |
| **Team Management** | Admin only | Invite staff, see who's using what |

---

## AI Provider Options

### For You (Admin)
- Set your Claude Pro key once
- Cost: Claude Pro monthly subscription
- Benefit: Team gets Pro features for free

### For Team Members
**Option A: Use Your Pro Key**
- They provide their own Claude/ChatGPT key
- They pay for their own subscription
- Independent from your setup

**Option B: Use Your Claude Pro (Free)**
- Select Claude → Free plan
- No API key needed
- They use your admin key automatically
- Their usage counts against your Claude quota

---

## Important Settings

### ⚙️ Change Default Password
After first login, consider:
1. Go to Anthropic console (https://console.anthropic.com)
2. Rotate your API key for security
3. Use the new key in the app

### 🔐 Security Best Practices
- ✅ Keep API keys private
- ✅ Don't share keys via email/chat
- ✅ Clear browser data when leaving shared computers
- ✅ Use HTTPS only in production

### 📊 Monitor Usage
Visit your provider consoles to track:
- **Claude**: https://console.anthropic.com/account/billing
- **ChatGPT**: https://platform.openai.com/account/billing/overview

---

## Troubleshooting

### "No provider configured"
→ Go to Settings, select Claude, save your API key

### "Invalid API key"
→ Check it starts with `sk-ant-` for Claude or `sk-` for ChatGPT
→ Verify it's not expired in your provider console

### Chat not saving
→ Check you're logged in as the same user
→ Chat history is per-user, per-browser

### Can't invite team members
→ Make sure you're logged in as admin (drew@thegardener.co.za)
→ The "Team Members" section should appear in Settings

---

## Keyboard Shortcuts

- **Ctrl/Cmd + K** → Jump to Chat
- **Escape** → Go to Home
- **Shift + Enter** → New line in chat (Enter alone sends)

---

## What Changed From Original

### Before
- Single-user only
- API key stored globally
- No team management
- Basic settings

### Now (Enhanced)
- ✅ Multi-user with login
- ✅ Per-user API keys OR shared admin key
- ✅ Team member management
- ✅ Multiple AI providers (Claude, ChatGPT, Copilot coming)
- ✅ User-specific chat history
- ✅ Admin control panel
- ✅ "Remember me" login
- ✅ Claude Pro cost optimization

---

## API Costs

### Scenario 1: Shared Claude Pro
- **Admin cost:** $20/month Claude Pro
- **Team cost:** FREE (use admin's quota)
- **Total team cost:** $20/month
- **Per person:** $20 ÷ team size

### Scenario 2: Everyone Brings Their Own Key
- **Admin cost:** $20/month Claude Pro
- **Each team member:** Their own ChatGPT/Claude cost
- **Total:** $20 + (each member's cost)

### Scenario 3: Mixed Setup
- Admin provides Claude Pro for office (Free plan users)
- Power users provide their own ChatGPT Pro keys
- **Flexible:** Whatever works for your team

---

## Next Steps

1. ✅ Get Claude Pro API key
2. ✅ Enter it in Settings
3. ✅ Test the connection
4. ✅ Invite your team
5. ✅ Start using the workbench!

---

Need help? See `SETUP_GUIDE.md` for detailed documentation.
