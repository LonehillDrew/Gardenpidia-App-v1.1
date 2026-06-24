# GardenPedia Workbench - Enhanced Setup Guide

## New Features Overview

### 1. **Secure Login System**
- Email/password authentication
- "Remember me" functionality
- Account creation for team members
- Password protected access

### 2. **Multi-User Support**
- User database stored locally
- Each user has their own chat history
- Individual AI provider configuration
- Admin account for team management

### 3. **AI Provider Selection**
Multiple AI providers supported with different plan tiers:

#### Claude
- **Free**: Use your own API key
- **Pro**: Use your own API key (recommended for personal use)
- **Max**: Use your own API key (for advanced users)
- **Admin Pro Bypass**: Admin can set Claude Pro key that other team members use for free

#### ChatGPT
- **Free**: Use your own API key
- **Pro**: Use your own API key

#### MS Copilot
- **Free**: Coming soon
- **Paid**: Coming soon

### 4. **Admin Panel**
- View all team members
- Invite new team members (auto-generated password: `welcome123`)
- Manage provider settings across the team
- Set the main Claude Pro key for the organization

## Default Admin Account

**Email:** `drew@thegardener.co.za`
**Password:** `admin123` (first login only)

⚠️ **IMPORTANT:** Change this password after first login!

## How It Works

### For Regular Users

1. **Sign Up or Sign In**
   - Create a new account or use admin credentials to sign in
   - Check "Remember me" to stay logged in

2. **Configure AI Provider**
   - Go to Settings
   - Select your preferred AI provider (Claude, ChatGPT, or Copilot)
   - Choose your plan tier
   - Enter your API key (if required)
   - Save settings

3. **Use the Workbench**
   - Chat: Have conversations with your AI
   - Fact Finder: Generate format-checked garden facts
   - Research: Get sourced answers
   - All features work with your configured AI provider

### For Admin (Drew)

1. **Team Member Management**
   - Settings → Team Members (Admin) section
   - Click "Invite Team Member" to add office staff
   - Each member gets auto-generated password: `welcome123`
   - They can change password on first login

2. **Claude Pro Bypass Setup**
   - Settings → AI Provider → Claude
   - Select "Pro" plan
   - Enter your Claude Pro API key
   - Click "Save Settings"
   - Team members on Free plan can now use Claude Pro features automatically!

3. **Cost Optimization**
   - Your Claude Pro API key powers the entire team
   - No additional API costs for team members using Claude
   - Each team member's usage counts against your Claude Pro quota
   - Monitor usage in your Anthropic console

## Storage Details

### Local Storage Keys
All data is stored in browser localStorage:

- `gp_users`: User database (all users)
- `gp_current_user`: Currently logged-in user
- `gp_remember_email`: Remembered email for auto-login
- `gp_chat_history_[email]`: Individual chat histories per user
- `gp_model`: Selected AI model
- `gp_admin_claude_key`: Admin's Claude Pro key

### Security Notes
- Passwords are hashed (simple hash, suitable for local use)
- API keys are stored in browser only
- Nothing is sent to GitHub or external servers
- Clear your browser data to completely logout and delete local data

## API Key Setup

### Getting Claude API Key
1. Visit https://console.anthropic.com
2. Navigate to API Keys section
3. Create new API key
4. Copy the key (starts with `sk-ant-`)
5. Never share this key

### Getting ChatGPT API Key
1. Visit https://platform.openai.com
2. Navigate to API Keys
3. Create new API key
4. Copy the key (starts with `sk-`)
5. Never share this key

## Tips for Office Setup

### Scenario 1: Using Your Claude Pro for Everyone
1. Sign in as admin
2. Go to Settings → AI Provider
3. Select Claude → Pro plan
4. Enter your Claude Pro API key
5. Save settings
6. Invite team members
7. Team members select Claude Free plan
8. They'll automatically use your Pro key

### Scenario 2: Team Members with Their Own Keys
1. Each team member creates their account
2. They provide their own Claude/ChatGPT API key
3. Admins can still invite them for better management
4. Each user configures their own provider

### Scenario 3: Mixed Approach
- Some staff use your Claude Pro key (Free plan)
- Others use their own ChatGPT Pro key
- All tracked in Settings → Team Members

## Troubleshooting

### "No provider configured"
- Go to Settings
- Select an AI provider
- Enter API key if required
- Click "Test Connection"

### "Invalid API key"
- Check key starts with correct prefix (`sk-ant-` for Claude, `sk-` for ChatGPT)
- Verify key hasn't expired in your provider console
- Try creating a new key

### Chat history not appearing
- Check if you're logged in as the same user
- Clear browser cache if needed
- Chat history is per-user, per-browser

### Can't log in
- Check caps lock on password
- Try signing up as a new user
- Clear browser cookies if needed

## First-Time Checklist

- [ ] Access the app
- [ ] Sign in as admin (drew@thegardener.co.za / admin123)
- [ ] Change admin password in your Anthropic/OpenAI console
- [ ] Set up Claude Pro API key in Settings
- [ ] Test connection
- [ ] Invite team members
- [ ] Share app URL with team
- [ ] Instruct team to create accounts or use invites

## Future Enhancements

- MS Copilot integration
- Usage analytics dashboard
- API cost tracking per user
- Advanced permission controls
- Cloud backup option
- Multi-device sync
